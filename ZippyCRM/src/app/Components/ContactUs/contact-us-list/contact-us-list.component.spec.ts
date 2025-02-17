import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsListComponent } from './contact-us-list.component';

describe('ContactUsListComponent', () => {
  let component: ContactUsListComponent;
  let fixture: ComponentFixture<ContactUsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactUsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactUsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
