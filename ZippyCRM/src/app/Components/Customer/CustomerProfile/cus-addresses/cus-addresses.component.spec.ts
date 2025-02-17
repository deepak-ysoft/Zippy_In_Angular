import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CusAddressesComponent } from './cus-addresses.component';

describe('CusAddressesComponent', () => {
  let component: CusAddressesComponent;
  let fixture: ComponentFixture<CusAddressesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CusAddressesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CusAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
