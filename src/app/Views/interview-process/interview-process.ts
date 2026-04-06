import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { LucideAngularModule, Send } from "lucide-angular";
import { InterviewServices } from '../../Services/Interview/interview';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Jobs } from '../../Data/Job/job.data';
import { Job } from '../../Model/Job/job';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview-process',
  standalone: true,
  imports: [LucideAngularModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './interview-process.html',
  styleUrls: ['./interview-process.scss'],
  providers: [InterviewServices]
})
export class InterviewProcess implements OnInit, AfterViewChecked {
  readonly Send = Send;
  isTyping = false;
  showEndButton = false;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
  userInput = '';
  interviewCompleted = false;

  interviewSections = [
    'Introduction & influences',
    'Work experience',
    'Problem-solving',
    'Job alignment',
    'Follow-ups & tasks',
    'Teamwork',
    'Discipline & documentation',
    'Mastery & initiative',
    'Adaptability',
    'Career goals',
    'Salary & negotiation',
    'Closing'
  ];

  currentSectionIndex = 0;
  progressPercent = 0;
  currentSection = this.interviewSections[0];
  applicantName = '';
  applicantPosition = '';
  selectedJob: Job | undefined;
  jobs = Jobs;
  private shouldScroll = false;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private interviewService: InterviewServices,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.applicantName = sessionStorage.getItem('applicantName') ?? 'Applicant';
    this.applicantPosition = sessionStorage.getItem('applicantPosition') ?? 'Position';
    this.selectedJob = this.jobs.find(j => j.role.toLowerCase() === this.applicantPosition.toLowerCase());

    const savedMessages = sessionStorage.getItem('interviewMessages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    } else {
      this.startInterview();
    }

    const savedIndex = sessionStorage.getItem('currentSectionIndex');
    if (savedIndex) {
      this.currentSectionIndex = +savedIndex;
      this.currentSection = this.interviewSections[this.currentSectionIndex];
      this.updateSectionProgress();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom(true);
      this.shouldScroll = false;
    }
  }

  startInterview() {
    if (!this.selectedJob) return;

    this.interviewService.sendMessage(this.messages, this.selectedJob, 'start').subscribe(res => {
      const reply = res.choices[0].message.content;
      this.messages.push({ role: 'assistant', content: reply });
      this.saveMessages();
      this.shouldScroll = true;
      this.cdr.detectChanges();
    });
  }

  sendMessage() {
    if (!this.userInput.trim() || !this.selectedJob) return;

    const userMessage = this.userInput.trim();
    this.messages.push({ role: 'user', content: userMessage });
    this.saveMessages();
    this.userInput = '';
    this.shouldScroll = true;

    if (["end"].includes(userMessage.toLowerCase())) {
      this.endInterview();
      return;
    }

    this.isTyping = true;

    this.interviewService.sendMessage(this.messages, this.selectedJob, userMessage).subscribe(res => {
      const reply = res.choices[0].message.content;

      setTimeout(() => {
        this.messages.push({ role: 'assistant', content: reply });
        this.detectSectionProgress(reply);
        this.updateSectionProgress();
        this.saveMessages();
        this.isTyping = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
        this.scrollToBottom();

        if (/thank you for taking the time|we’ll review your application|have a great day/i.test(reply)) {
          this.showEndButton = true;
        }
      }, 2000);
    });
  }

  endInterview() {
    if (!this.selectedJob) return;

    this.interviewService.sendMessage(this.messages, this.selectedJob, 'end').subscribe(res => {
      const reply = res.choices[0].message.content;
      this.messages.push({ role: 'assistant', content: reply });
      this.interviewCompleted = true;
      this.saveMessages();
      this.shouldScroll = true;
      this.cdr.detectChanges();
      this.scrollToBottom();
      this.fetchPrivateRatings();
    });
  }

  private fetchPrivateRatings() {
    if (!this.selectedJob) return;

    this.interviewService.sendMessage(this.messages, this.selectedJob, 'ratings').subscribe(res => {
      const evalText = res.choices[0].message.content;
      const ratings = this.extractRatings(evalText);
      sessionStorage.setItem('evaluationRatings', JSON.stringify(ratings));
      sessionStorage.setItem('generalInterview', 'Done');
    });
  }

  private extractRatings(evalText: string): {
    ambition: number;
    influence: number;
    discipline: number;
    skillsDevelopment: number;
    care: number;
    technicalSkills: number;
    commentary?: string;
  } {
    try {
      const jsonStart = evalText.indexOf('{');
      const jsonEnd = evalText.lastIndexOf('}') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonString = evalText.substring(jsonStart, jsonEnd);
        const data = JSON.parse(jsonString);

        return {
          ambition: data.ambition ?? 0,
          influence: data.influence ?? 0,
          discipline: data.discipline ?? 0,
          skillsDevelopment: data.skillsDevelopment ?? 0,
          care: data.care ?? 0,
          technicalSkills: data.technicalSkills ?? 0,
          commentary: data.commentary ?? ''
        };
      }
    } catch (e) {
      console.error('Failed to parse ratings JSON', e);
    }

    return {
      ambition: 0,
      influence: 0,
      discipline: 0,
      skillsDevelopment: 0,
      care: 0,
      technicalSkills: 0
    };
  }


  private saveMessages() {
    sessionStorage.setItem('interviewMessages', JSON.stringify(this.messages));
    sessionStorage.setItem('currentSectionIndex', this.currentSectionIndex.toString());
  }

  private detectSectionProgress(reply: string) {
    const checkpoints = [
      { keyword: /introduce|background/i, index: 0 },
      { keyword: /responsibility|work experience|company/i, index: 1 },
      { keyword: /problem|challenge|pressure/i, index: 2 },
      { keyword: /qualification|align/i, index: 3 },
      { keyword: /follow[- ]?up|tasks?/i, index: 4 },
      { keyword: /team|collaborat/i, index: 5 },
      { keyword: /discipline|document/i, index: 6 },
      { keyword: /mastery|initiative|feedback/i, index: 7 },
      { keyword: /adapt|growth/i, index: 8 },
      { keyword: /career|strength/i, index: 9 },
      { keyword: /salary|negotiat/i, index: 10 },
      { keyword: /closing|thank you/i, index: 11 }
    ];

    for (let check of checkpoints) {
      if (check.keyword.test(reply)) {
        this.currentSectionIndex = Math.max(this.currentSectionIndex, check.index);
        this.currentSection = this.interviewSections[this.currentSectionIndex];
        break;
      }
    }
  }

  private updateSectionProgress() {
    const total = this.interviewSections.length;
    this.progressPercent = Math.round(((this.currentSectionIndex + 1) / total) * 100);
  }

  private scrollToBottom(smooth: boolean = true) {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTo({
          top: this.messagesContainer.nativeElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, 150);
  }

  proceedNext() {
    this.endInterview();
    sessionStorage.setItem('step', '3');
    location.reload();
  }
}
