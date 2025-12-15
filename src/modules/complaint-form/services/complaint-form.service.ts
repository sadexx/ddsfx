import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintForm } from 'src/modules/complaint-form/entities';
import { CreateComplaintFormDto } from 'src/modules/complaint-form/common/dto';
import { ESortOrder } from 'src/common/enums';
import { User } from 'src/modules/users/entities';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TUserForCreateComplaintForm, UserForCreateComplaintForm } from 'src/modules/complaint-form/common/types';
import { IMessageOutput } from 'src/common/outputs';

@Injectable()
export class ComplaintFormService {
  constructor(
    @InjectRepository(ComplaintForm)
    private readonly complaintFormRepository: Repository<ComplaintForm>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getAll(user: ITokenUserPayload): Promise<ComplaintForm[]> {
    const complaintForms = await this.complaintFormRepository.find({
      select: { subjectUser: { id: true } },
      where: { reportedUser: { id: user.sub } },
      relations: { subjectUser: true },
      order: { creationDate: ESortOrder.DESC },
    });

    return complaintForms;
  }

  public async createComplaintForm(
    currentUser: ITokenUserPayload,
    dto: CreateComplaintFormDto,
  ): Promise<IMessageOutput> {
    const reportedUser = await findOneOrFailTyped<TUserForCreateComplaintForm>(currentUser.sub, this.userRepository, {
      select: UserForCreateComplaintForm.select,
      where: { id: currentUser.sub },
    });

    const subjectUser = await findOneOrFailTyped<TUserForCreateComplaintForm>(dto.subjectUserId, this.userRepository, {
      select: UserForCreateComplaintForm.select,
      where: { id: dto.subjectUserId },
    });

    const complaintForm = this.complaintFormRepository.create({
      ...dto,
      reportedUser: reportedUser,
      subjectUser: subjectUser,
    });
    await this.complaintFormRepository.save(complaintForm);

    return { message: 'We received your complaint. Thank you!' };
  }
}
