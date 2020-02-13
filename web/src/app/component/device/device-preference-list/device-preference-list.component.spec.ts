import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePreferenceListComponent } from './device-preference-list.component';

describe('DevicePreferenceListComponent', () => {
  let component: DevicePreferenceListComponent;
  let fixture: ComponentFixture<DevicePreferenceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePreferenceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePreferenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
