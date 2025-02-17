import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CusDocumentsComponent } from './cus-documents.component';

describe('CusDocumentsComponent', () => {
  let component: CusDocumentsComponent;
  let fixture: ComponentFixture<CusDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CusDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CusDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
