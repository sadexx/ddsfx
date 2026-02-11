import { ICemetery } from 'src/modules/cemetery/common/interfaces';
import { Address } from 'src/modules/address/entities';

export const cemeteriesSeedData: ICemetery[] = [
  {
    name: 'Лісове кладовище',
    address: {
      latitude: 50.499444,
      longitude: 30.633611,
      country: 'Україна',
      region: 'Київська область',
      city: 'Київ',
      streetName: 'Крайня',
      streetNumber: '3',
      postcode: null,
      building: null,
      unit: null,
      organizationName: null,
      timezone: null,
      cemetery: null,
    } as Address,
  },
];
