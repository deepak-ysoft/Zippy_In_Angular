import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowNotificationPopupComponent } from './show-notification-popup.component';

describe('ShowNotificationPopupComponent', () => {
  let component: ShowNotificationPopupComponent;
  let fixture: ComponentFixture<ShowNotificationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowNotificationPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowNotificationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
