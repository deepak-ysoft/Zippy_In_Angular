import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileNeedHelpComponent } from './user-profile-need-help.component';

describe('UserProfileNeedHelpComponent', () => {
  let component: UserProfileNeedHelpComponent;
  let fixture: ComponentFixture<UserProfileNeedHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileNeedHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileNeedHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
