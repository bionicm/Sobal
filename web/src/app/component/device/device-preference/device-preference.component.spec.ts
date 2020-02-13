import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePreferenceComponent } from './device-preference.component';

describe('DevicePreferenceComponent', () => {
  let component: DevicePreferenceComponent;
  let fixture: ComponentFixture<DevicePreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
