import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CusTaskComponent } from './cus-task.component';

describe('CusTaskComponent', () => {
  let component: CusTaskComponent;
  let fixture: ComponentFixture<CusTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CusTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CusTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
