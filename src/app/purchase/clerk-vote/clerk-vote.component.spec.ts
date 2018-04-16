import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClerkVoteComponent } from './clerk-vote.component';

describe('ClerkVoteComponent', () => {
  let component: ClerkVoteComponent;
  let fixture: ComponentFixture<ClerkVoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClerkVoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClerkVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
