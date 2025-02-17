import { Component, inject, Input, OnInit } from '@angular/core';
import { DocumentsService } from '../../../../Services/customerService/documents.service';
import { Documents } from '../../../../Models/cusDocuments.model';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { EMPTY, switchMap, throwError } from 'rxjs';
declare var bootstrap: any;
@Component({
  selector: 'app-cus-documents',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cus-documents.component.html',
  styleUrl: './cus-documents.component.css',
})
export class CusDocumentsComponent implements OnInit {
  documentsList: Documents[] = [];
  service = inject(DocumentsService);
  @Input() customerId!: any;
  currentFolderContent: any[] = []; // Stores current folder's content
  folderHistory: string[] = []; // Stores folder navigation history
  currentPath?: string = ''; // Keeps track of the current folder path
  currentPathForCreate: string = ''; // Current path variable
  editFolderName: string | null = null;
  errorMessage: string | null = null;
  extension = '';
  baseName = '';
  newName = '';

  // For Create folder form validation
  folderForm: FormGroup = new FormGroup({
    folderName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      noDotValidator(), // Apply the custom noDotValidator
    ]),
  });

  // for rename folder form validation
  renameForm: FormGroup = new FormGroup({
    fName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      noDotValidator(), // Apply the custom noDotValidator
    ]),
  });

  constructor() {}

  loadRootFolder() {
    this.getInnerFiles(''); // Fetch root folder contents
  }

  ngOnInit(): void {
    this.getCustomerDocuments(this.customerId);
    document.addEventListener('click', this.closeContextMenu.bind(this));
  }

  getCustomerDocuments(id: any) {
    this.service.getDocuments(id).subscribe((res: any) => {
      this.currentFolderContent = res;
    });
  }

  getFileExtension(fileName: string): string {
    if (!fileName || fileName.lastIndexOf('.') === -1) {
      return ''; // No extension found
    }

    const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
    return extension; // Ensure a valid extension is returned
  }

  // Function to get inner files of a folder by calling the API
  getInnerFiles(path: string) {
    this.currentPathForCreate = path;
    if (this.folderHistory.length === 0 && this.customerId != undefined) {
      this.folderHistory.push(
        'C:\\Users\\YSOFT_9\\Desktop\\Deepak Saini\\ZippyCRM_UsingAngular_API\\ZippyCRM_API\\Files\\DocumentManager\\Customer\\' +
          this.customerId
      );
    }
    // Push the current path to history before navigating to the new folder
    if (this.currentPath) {
      this.folderHistory.push(this.currentPath);
    }

    this.currentPath = path; // Update the current path

    // API call to get folder contents
    this.service.getChildAndParentDocuments(path).subscribe(
      (res: any) => {
        this.currentFolderContent = res; // Ensure it's an array
      },
      (error) => {
        console.error('Error fetching folder contents', error);
        this.currentFolderContent = []; // In case of error, default to an empty array
      }
    );
  }

  // Function to create a folder
  createFolder(folderName: string) {
    if (this.currentPathForCreate == '') {
      this.currentPathForCreate =
        'C:\\Users\\YSOFT_9\\Desktop\\Deepak Saini\\ZippyCRM_UsingAngular_API\\ZippyCRM_API\\Files\\DocumentManager\\Customer\\' +
        this.customerId;
    }
    this.service
      .createFolder(folderName, this.currentPathForCreate, this.customerId)
      .subscribe((res: any) => {
        if (res && res.success) {
          // Introduce a slight delay to ensure the folder is created
          setTimeout(() => {
            this.getInnerFiles(res.path); // Fetch the folder contents
          }, 200); // A 200ms delay (adjustable)
          this.folderForm.reset();
        }
      });
  }

  // when user search any folder 
  onSearchInput(event: Event) {
    const input = (event.target as HTMLInputElement).value; // Type assertion
    if (input == '') {
      this.getCustomerDocuments(this.customerId);
    }
    this.SearchFileOrFolder(input);
  }
  SearchFileOrFolder(sreachedFolderName: string) {
    this.service
      .serchFileOrFolderSer(this.customerId, sreachedFolderName)
      .subscribe((res: any) => {
        if (res != null) {
          this.currentFolderContent = res; // Fetch the folder contents
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'No Files Here.',
            icon: 'error',
            timer: 2000, // Auto close after 2000 milliseconds
            showConfirmButton: false,
          });
        }
      });
  }

  // Function to go back to the parent folder
  getback() {
    if (this.folderHistory.length > 0) {
      // Pop the last folder from history to get the parent folder
      const previousPath = this.folderHistory.pop();
      if (previousPath != undefined) {
        this.currentPathForCreate = previousPath;
      }
      // Set the current path to the previous folder's path
      this.currentPath = previousPath;
      const headers = new HttpHeaders().set('path', 'Back');
      // Fetch the previous folder's content
      this.service.getChildAndParentDocuments(previousPath).subscribe(
        (res: any) => {
          this.currentFolderContent = res; // Update folder contents
        },
        (error) => {
          console.error('Error fetching folder contents', error);
        }
      );
    }
  }
  // Method to copy the folder
  copyFolder(folderName: string, filePath: string, type: string) {
    this.service
      .copyFolder(folderName, this.customerId, type, filePath)
      .subscribe(
        (response) => {
        },
        (error) => {
          console.error('Error copying folder:', error);
        }
      );
  }

  // Method to copy the folder
  moveFolder(folderName: string, filePath: string, type: string) {
    this.service
      .copyFolder(folderName, this.customerId, type, filePath)
      .subscribe(
        (response) => {
        },
        (error) => {
          console.error('Error copying folder:', error);
        }
      );
  }
// To paste any thing
  onPasteFolder(destinationFoldername: string, filePath: string) {
    this.service
      .pasteFolder(destinationFoldername, this.customerId, filePath)
      .subscribe(
        (response) => {
          this.getCustomerDocuments(this.customerId);
          // Handle successful response
        },
        (error) => {
          console.error('Error pasting folder:', error);
          // Handle error response
        }
      );
  }

  // To delete a folder
  deleteFolder(destinationFoldername: string, filePath: string) {
    this.service
      .deleteFolder(destinationFoldername, filePath)
      .subscribe((response) => {
        this.getInnerFiles(response.path);
      });
  }

  // When user click to rename folder or file then fill folder name in input box
  startEditing(folder: any) {
    const { baseName: base, extension: ext } = this.splitFileName(folder.name);
    this.editFolderName = folder.name;
    this.renameForm.patchValue({ fName: base });
    this.extension = ext;
    this.errorMessage = null;
  }

  // Function to split file name and extension
  splitFileName(fileName: string): { baseName: string; extension: string } {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // If no extension, return the whole name as baseName
      return { baseName: fileName, extension: '' };
    }
    return {
      baseName: fileName.substring(0, lastDotIndex),
      extension: fileName.substring(lastDotIndex),
    };
  }
  // When user rename a folder or file and click to save
  saveName(folder: any) {
    this.baseName = this.renameForm.get('fName')?.value;
    if (this.extension != '') {
      this.newName = this.baseName + this.extension;
    } else {
      this.newName = this.baseName;
    }
    // Attempt to rename folder
    this.service
      .renameFolder(folder.path, this.editFolderName!, this.newName)
      .pipe(
        switchMap((res: any) => {
          if (res.success) {
            folder.name = this.newName;
            this.editFolderName = null;

            // Ensure we handle the directory response properly
            return this.service.getDirectory(res.path);
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Folder already exists.',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false,
            });
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res: string) => {
          const updatedFolderPath = res; // No need to parse if it's plain text
          if (updatedFolderPath) {
            this.getInnerFiles(updatedFolderPath);
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            Swal.fire({
              title: 'Error!',
              text: 'A file or folder with the new name already exists.',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        },
      });
  }

  cancelEdit() {
    this.editFolderName = null;
    this.errorMessage = null;
  }
  selectedFolder: any;
  isContextMenuVisible = false;
  contextMenuPosition = { top: '0px', left: '0px' };

// When user right click on mouse then open a model popup for copy, move, paste etc.
  openContextMenu(event: MouseEvent, folder: any) {
    event.preventDefault(); // Prevent the default context menu
    this.selectedFolder = folder; // Set the selected folder

    // Capture and set mouse position for the custom context menu
    this.contextMenuPosition = {
      top: `${event.pageY - 110}px`,
      left: `${150}px`,
    };

    this.isContextMenuVisible = true; // Show the context menu
  }

  closeContextMenu() {
    this.isContextMenuVisible = false; // Hide the context menu
    this.selectedFolder = null; // Clear the selected folder
  }
}
// validation for rename and create folder '.(dot) not allowed. 
export function noDotValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.includes('.')) {
      return { noDot: true }; // Return an error object if a dot is found
    }
    return null; // No error if no dot is found
  };
}
