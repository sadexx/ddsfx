import { BadRequestException, Injectable } from '@nestjs/common';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import * as Handlebars from 'handlebars';
import { EEmailLayoutName, EEmailTemplateName } from 'src/libs/emailer/common/enums';
import { LokiLogger } from 'src/libs/logger';

@Injectable()
export class EmailerTemplateService {
  private readonly lokiLogger = new LokiLogger(EmailerTemplateService.name);
  private readonly layouts: Record<string, Handlebars.TemplateDelegate> = {};
  private readonly bodies: Record<string, Handlebars.TemplateDelegate> = {};

  constructor() {
    const basePath = join(__dirname, '..', 'common', 'templates');
    const layoutsDirectory = join(basePath, 'layouts');
    const bodiesDirectory = join(basePath, 'bodies');

    const layoutFiles = readdirSync(layoutsDirectory);

    for (const file of layoutFiles) {
      if (extname(file) !== '.hbs') {
        continue;
      }

      const name = basename(file, '.hbs');
      const filePath = join(layoutsDirectory, file);
      const source = readFileSync(filePath, 'utf-8');
      this.layouts[name] = Handlebars.compile(source);
    }

    const bodyFiles = readdirSync(bodiesDirectory);

    for (const file of bodyFiles) {
      if (extname(file) !== '.hbs') {
        continue;
      }

      const name = basename(file, '.hbs');
      const filePath = join(bodiesDirectory, file);
      const source = readFileSync(filePath, 'utf-8');
      this.bodies[name] = Handlebars.compile(source);
    }
  }

  public renderTemplate(
    templateName: EEmailTemplateName,
    context: Record<string, string | number | boolean | null | object>,
    layoutName: EEmailLayoutName = EEmailLayoutName.BASE,
  ): string {
    const bodyTemplate = this.bodies[templateName];

    if (!bodyTemplate) {
      this.lokiLogger.error(`Body email template not found: ${templateName}.`);
      throw new BadRequestException('Email content not found');
    }

    const layoutTemplate = this.layouts[layoutName];

    if (!layoutTemplate) {
      this.lokiLogger.error(`Layout email template not found: ${layoutName}.`);
      throw new BadRequestException('Email layout not found');
    }

    const bodyHtml = bodyTemplate({ ...context });

    return layoutTemplate({ ...context, body: bodyHtml });
  }
}
