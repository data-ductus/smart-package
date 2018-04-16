import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaySensorsComponent } from './display-sensors.component';

describe('DisplaySensorsComponent', () => {
  let component: DisplaySensorsComponent;
  let fixture: ComponentFixture<DisplaySensorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplaySensorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaySensorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
