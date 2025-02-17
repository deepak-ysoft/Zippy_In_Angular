export class Customer {
  cId: number; // Changed to required
  type: types; // Required
  pan: string; // Required, set default empty string
  gst: string; // Required, set default empty string
  title: title; // Required, set default title
  firstName: string; // Required, set default empty string
  middleName: string; // Required, set default empty string
  lastName: string; // Required, set default empty string
  position: string; // Required, set default empty string
  gender: gender; // Required
  dayOfBirth: Date; // Required
  phone: string; // Required, set default empty string
  phoneOther: string; // Required, set default empty string
  cell: string; // Required, set default empty string
  fax: string; // Required, set default empty string
  email: string; // Required, set default empty string
  email2: string; // Required, set default empty string
  website: string; // Required, set default empty string
  language: language; // Required
  comments: string; // Required, set default empty string
  imagepath: string; // Required, set default empty string
  photo: File | null; // Changed to nullable type
  fullName: string; // Required, will be generated

  constructor() {
    this.cId = 0; // Default to 0 or any meaningful ID
    this.type = types.Individual; // Default type
    this.pan = '';
    this.gst = '';
    this.title = title.Mr; // Default title
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.position = '';
    this.gender = gender.Male; // Default gender
    this.dayOfBirth = new Date(); // Default to today's date
    this.phone = '';
    this.phoneOther = '';
    this.cell = '';
    this.fax = '';
    this.email = '';
    this.email2 = '';
    this.website = '';
    this.language = language.English; // Default language
    this.comments = '';
    this.imagepath = '';
    this.photo = null; // Default to null
    this.fullName = this.generateFullName();
  }

  private generateFullName(): string {
    return `${this.title ? title[this.title] : ''} ${this.firstName || ''} ${
      this.middleName || ''
    } ${this.lastName || ''}`.trim();
  }
}

export enum types {
  Individual = 1,
  Commercial = 2,
}

export enum gender {
  Male = 1,
  Female = 2,
  Other = 3,
}

export enum language {
  Hindi = 1,
  English = 2,
  Rajasthani = 3,
  Gujrati = 4,
  Tamil = 5,
}

export enum title {
  Mr = 1,
  Miss = 2,
  Ms = 3,
  Mrs = 4,
}
