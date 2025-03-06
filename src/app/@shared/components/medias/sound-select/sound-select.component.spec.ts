import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundSelectComponent } from './sound-select.component';

describe('SoundSelectComponent', () => {
  let component: SoundSelectComponent;
  let fixture: ComponentFixture<SoundSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoundSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
