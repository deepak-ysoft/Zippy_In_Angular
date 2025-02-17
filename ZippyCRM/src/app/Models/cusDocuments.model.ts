export class Documents {
  public name: string; // File or directory name
  public path: string; // Path to the file or directory
  public isDirectory: boolean; // Indicates if it is a directory
  public sizeInBytes: number; // Size in bytes
  public createdDateTime?: Date; // File creation date

  // Calculate size in kilobytes
  get sizeInKilobytes(): number {
    return this.sizeInBytes / 1024.0;
  }

  constructor() {
    this.name = '';
    this.path = '';
    this.isDirectory = false;
    this.sizeInBytes = 0;
  }
}
