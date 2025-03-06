import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamSelectComponent } from './cam-select.component';

describe('CamSelectComponent', () => {
  let component: CamSelectComponent;
  let fixture: ComponentFixture<CamSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CamSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CamSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
