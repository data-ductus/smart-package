import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetTermsComponent } from './set-terms.component';

describe('SetTermsComponent', () => {
  let component: SetTermsComponent;
  let fixture: ComponentFixture<SetTermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetTermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
