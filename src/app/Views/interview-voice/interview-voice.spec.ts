import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewVoice } from './interview-voice';

describe('InterviewVoice', () => {
  let component: InterviewVoice;
  let fixture: ComponentFixture<InterviewVoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewVoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewVoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
