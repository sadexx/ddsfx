import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeceasedCorrection } from 'src/modules/deceased-correction/entities';
import { CreateDeceasedCorrectionDto } from 'src/modules/deceased-correction/common/dto';
import { IMessageOutput } from 'src/common/outputs';
import { Deceased } from 'src/modules/deceased/entities';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { ESortOrder } from 'src/common/enums';

@Injectable()
export class DeceasedCorrectionService {
  constructor(
    @InjectRepository(DeceasedCorrection)
    private readonly deceasedCorrectionRepository: Repository<DeceasedCorrection>,
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
  ) {}

  public async getAll(user: ITokenUserPayload): Promise<DeceasedCorrection[]> {
    const complaintForms = await this.deceasedCorrectionRepository.find({
      select: { deceased: { id: true } },
      where: { user: { id: user.sub } },
      relations: { deceased: true },
      order: { creationDate: ESortOrder.DESC },
    });

    return complaintForms;
  }

  public async createDeceasedCorrection(
    user: ITokenUserPayload,
    dto: CreateDeceasedCorrectionDto,
  ): Promise<IMessageOutput> {
    const deceased = await this.deceasedRepository.exists({
      where: { id: dto.deceasedId },
    });

    if (!deceased) {
      throw new NotFoundException('Deceased record not found');
    }

    const deceasedCorrection = this.deceasedCorrectionRepository.create({
      ...dto,
      user: { id: user.sub },
      deceased: { id: dto.deceasedId },
    });
    await this.deceasedCorrectionRepository.save(deceasedCorrection);

    return { message: 'We received your correction. Thank you!' };
  }
}
