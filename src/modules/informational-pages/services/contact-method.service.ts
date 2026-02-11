import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactMethod } from 'src/modules/informational-pages/entities';
import { Repository } from 'typeorm';
import { CreateContactMethodDto, UpdateContactMethodDto } from 'src/modules/informational-pages/common/dto';
import { IContactMethod } from 'src/modules/informational-pages/common/interfaces';
import { File } from 'src/libs/file-management/entities';
import {
  InformationalPagesQueryOptionsService,
  InformationalPagesValidationService,
} from 'src/modules/informational-pages/services';
import { UUIDParamDto } from 'src/common/dto';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TGetContactMethods, TUpdateContactMethod } from 'src/modules/informational-pages/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { StrictOmit } from 'src/common/types';

@Injectable()
export class ContactMethodService {
  constructor(
    @InjectRepository(ContactMethod)
    private readonly contactMethodRepository: Repository<ContactMethod>,
    private readonly informationalPagesQueryOptionsService: InformationalPagesQueryOptionsService,
    private readonly informationalPagesValidationService: InformationalPagesValidationService,
  ) {}

  public async getContactMethods(): Promise<TGetContactMethods[]> {
    const queryOptions = this.informationalPagesQueryOptionsService.getContactMethodsOptions();
    const contactMethods = await findManyTyped<TGetContactMethods[]>(this.contactMethodRepository, queryOptions);

    return contactMethods;
  }

  public async createContactMethod(dto: CreateContactMethodDto): Promise<void> {
    await this.informationalPagesValidationService.validateCreateContactMethod(dto, this.contactMethodRepository);

    await this.constructAndCreateContactMethod(dto);
  }

  public async updateContactMethod(param: UUIDParamDto, dto: UpdateContactMethodDto): Promise<void> {
    const queryOptions = this.informationalPagesQueryOptionsService.updateContactMethodOptions(param.id);
    const contactMethod = await findOneOrFailTyped<TUpdateContactMethod>(
      param.id,
      this.contactMethodRepository,
      queryOptions,
    );

    await this.updateContact(dto, contactMethod);
  }

  public async removeContactMethod(param: UUIDParamDto): Promise<void> {
    const result = await this.contactMethodRepository.delete(param.id);

    if (!result.affected) {
      throw new NotFoundException(`Contact method with id ${param.id} not found`);
    }
  }

  private async constructAndCreateContactMethod(dto: CreateContactMethodDto): Promise<void> {
    const contactMethodDto = this.constructCreateContactMethodDto(dto);
    await this.saveContactMethod(contactMethodDto);
  }

  private async saveContactMethod(dto: IContactMethod): Promise<void> {
    const newContactMethod = this.contactMethodRepository.create(dto);
    await this.contactMethodRepository.save(newContactMethod);
  }

  private async updateContact(dto: UpdateContactMethodDto, existingContactMethod: TUpdateContactMethod): Promise<void> {
    const contactMethodDto = this.constructUpdateContactMethodDto(dto, existingContactMethod);
    await this.contactMethodRepository.update({ id: existingContactMethod.id }, contactMethodDto);
  }

  private constructCreateContactMethodDto(dto: CreateContactMethodDto): IContactMethod {
    return {
      file: { id: dto.fileId } as File,
      description: dto.description,
      url: dto.url,
    };
  }

  private constructUpdateContactMethodDto(
    dto: UpdateContactMethodDto,
    existingContactMethod: TUpdateContactMethod,
  ): StrictOmit<IContactMethod, 'file'> {
    return {
      description: dto.description ?? existingContactMethod.description,
      url: dto.url ?? existingContactMethod.url,
    };
  }
}
