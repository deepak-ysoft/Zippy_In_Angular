export interface Job {
  jobId: number;
  jobTitle: string;
  // Add other properties as per your Job model
}

export enum AccountStatus {
  Active = 0,
  Inactive = 1,
  Deleted = 2,
}

export class Users {
  userId: number; // Assuming default value for new users
  username: string;
  company: string;
  country: string;
  address: string;
  phone: string;
  discription: string; // Typo in your C# model, corrected to Discription
  jobId: number;
  job?: Job; // Optional Job object
  imagePath?: string;
  photo?: File; // Using File for handling file uploads
  email: string;
  password: string;
  cPassword?: string; // Confirm password field
  accountSetup: boolean; // Default to false
  isActive: boolean; // Default to false
  accountStatus: AccountStatus; // Default to Inactive
s: any;

  constructor() {
    this.userId = 0; // Assuming default value for new users
    this.username = '';
    this.company = '';
    this.country = '';
    this.address = '';
    this.phone = '';
    this.discription = ''; // Typo in your C# model, corrected to Discription
    this.jobId = 0;
    this.email = '';
    this.password = '';
    this.accountSetup = false; // Default to false
    this.isActive = false; // Default to false
    this.accountStatus = AccountStatus.Inactive; // Default to Inactive
  }
}
