import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePreferenceListItemComponent } from './device-preference-list-item.component';

describe('DevicePreferenceListItemComponent', () => {
  let component: DevicePreferenceListItemComponent;
  let fixture: ComponentFixture<DevicePreferenceListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePreferenceListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePreferenceListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
