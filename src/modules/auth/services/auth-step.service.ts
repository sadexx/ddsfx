import { Injectable } from '@nestjs/common';
import { IRegistrationStep } from 'src/modules/auth/common/interfaces';
import { IRegistrationState } from 'src/libs/temporal-state/common/interfaces';
import { ERegistrationStep, ERegistrationStrategy } from 'src/modules/auth/common/enums';

@Injectable()
export class AuthStepService {
  constructor() {}

  public checkUserStepsCompletion(
    originalSteps: IRegistrationStep[],
    registrationData: IRegistrationState,
  ): IRegistrationStep[] {
    return originalSteps.map((step) => {
      let isCompleted = false;

      switch (step.name) {
        case ERegistrationStep.ADD_EMAIL:
          isCompleted = registrationData.email !== null;
          break;
        case ERegistrationStep.VERIFY_EMAIL:
          isCompleted = registrationData.isVerifiedEmail;
          break;
        case ERegistrationStep.CREATE_PASSWORD:
          isCompleted = registrationData.password !== null;
          break;
        case ERegistrationStep.ADD_PHONE:
          isCompleted = registrationData.phoneNumber !== null;
          break;
        case ERegistrationStep.VERIFY_PHONE:
          isCompleted = registrationData.isVerifiedPhoneNumber;
          break;
        case ERegistrationStep.CONDITIONS_AGREEMENT:
          isCompleted = registrationData.isAgreedToConditions;
          break;
        case ERegistrationStep.FINISH:
          isCompleted = false;
          break;
        default:
          isCompleted = false;
      }

      return { ...step, isCompleted };
    });
  }

  public determineStepsStrategy(strategy: ERegistrationStrategy): IRegistrationStep[] {
    switch (strategy) {
      case ERegistrationStrategy.EMAIL:
        return this.getEmailSteps();

      case ERegistrationStrategy.PHONE_NUMBER:
        return this.getPhoneSteps();

      case ERegistrationStrategy.APPLE:
      case ERegistrationStrategy.GOOGLE:
      case ERegistrationStrategy.FACEBOOK:
        return this.getOAuthSteps();
    }
  }

  private getEmailSteps(): IRegistrationStep[] {
    return [
      { index: 0, name: ERegistrationStep.ADD_EMAIL, isCompleted: false },
      { index: 1, name: ERegistrationStep.VERIFY_EMAIL, isCompleted: false },
      { index: 2, name: ERegistrationStep.CREATE_PASSWORD, isCompleted: false },
      { index: 3, name: ERegistrationStep.CONDITIONS_AGREEMENT, isCompleted: true },
      { index: 4, name: ERegistrationStep.FINISH, isCompleted: false },
    ];
  }

  private getPhoneSteps(): IRegistrationStep[] {
    return [
      { index: 0, name: ERegistrationStep.ADD_PHONE, isCompleted: false },
      { index: 1, name: ERegistrationStep.VERIFY_PHONE, isCompleted: false },
      { index: 2, name: ERegistrationStep.CONDITIONS_AGREEMENT, isCompleted: true },
      { index: 3, name: ERegistrationStep.FINISH, isCompleted: false },
    ];
  }

  private getOAuthSteps(): IRegistrationStep[] {
    return [
      { index: 0, name: ERegistrationStep.CONDITIONS_AGREEMENT, isCompleted: true },
      { index: 1, name: ERegistrationStep.FINISH, isCompleted: false },
    ];
  }
}
