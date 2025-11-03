import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { InterviewServices } from '../../Services/Interview/interview';
import { Job } from '../../Model/Job/job';
import { Jobs } from '../../Data/Job/job.data';
import { Router } from '@angular/router';
import { LucideAngularModule, Mic, StopCircle } from 'lucide-angular';

@Component({
  selector: 'app-voice-interview',
  standalone: true,
  imports: [CommonModule, HttpClientModule, LucideAngularModule],
  templateUrl: './interview-voice.html',
  styleUrls: ['./interview-voice.scss'],
  providers: [InterviewServices]
})
export class VoiceInterviewComponent implements OnInit, AfterViewChecked {
  readonly Mic = Mic;
  readonly StopCircle = StopCircle;
  messages: { role: string; content: string }[] = [];
  isTyping = false;
  isRecording = false;
  showEndButton = false;
  interviewCompleted = false;
  isProcessingAudio = false;

  private mediaRecorder!: MediaRecorder;
  private audioChunks: BlobPart[] = [];

  applicantName = '';
  applicantPosition = '';
  selectedJob: Job | undefined;
  jobs = Jobs;

  userInput = '';
  openaiKey = '';

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
  private shouldScroll = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  get latestAssistant() {
    return [...this.messages].reverse().find(m => m.role === 'assistant') || null;
  }
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private interviewService: InterviewServices
  ) {}

  ngOnInit() {
    this.applicantName = sessionStorage.getItem('applicantName') ?? 'Applicant';
    this.applicantPosition = sessionStorage.getItem('applicantPosition') ?? 'Position';
    this.selectedJob = this.jobs.find(
      j => j.role.toLowerCase() === this.applicantPosition.toLowerCase()
    );

    const savedMessages = sessionStorage.getItem('voiceInterviewMessages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    } else {
      this.startInterview();
    }

    const savedIndex = sessionStorage.getItem('currentVoiceSectionIndex');
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
      this.playVoiceResponse(reply);
      this.shouldScroll = true;
      this.cdr.detectChanges();
    });
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = e => this.audioChunks.push(e.data);
      this.mediaRecorder.onstop = () => this.processAudio();
      this.mediaRecorder.start();
      this.isRecording = true;
      this.cdr.detectChanges();
    });
  }

  stopRecording() {
    if (this.isRecording && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.cdr.detectChanges();
    }
  }

  async processAudio() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'input.webm');
    formData.append('model', 'whisper-1');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.openaiKey}`
    });

    this.isProcessingAudio = true;
    this.cdr.detectChanges();

    try {
      const res: any = await this.http
        .post('https://api.openai.com/v1/audio/transcriptions', formData, { headers })
        .toPromise();

      this.userInput = res.text;
      this.messages.push({ role: 'user', content: this.userInput });
      this.isProcessingAudio = false;
      this.cdr.detectChanges();
      this.sendMessage();
    } catch (err) {
      console.error('Whisper error:', err);
      this.isProcessingAudio = false;
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || !this.selectedJob) return;
    const userMessage = this.userInput.trim();

    if (userMessage.toLowerCase() === 'end') {
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
        this.playVoiceResponse(reply);
        this.isTyping = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
        this.scrollToBottom();

        if (/thank you|we’ll review your application|have a great day/i.test(reply)) {
          this.showEndButton = true;
        }
      }, 1000);
    });
  }

  endInterview() {
    if (!this.selectedJob) return;

    this.interviewService.sendMessage(this.messages, this.selectedJob, 'end').subscribe(res => {
      const reply = res.choices[0].message.content;
      this.messages.push({ role: 'assistant', content: reply });
      this.interviewCompleted = true;
      this.saveMessages();
      this.playVoiceResponse(reply);
      this.shouldScroll = true;
      this.scrollToBottom();
      this.fetchPrivateRatings();
      sessionStorage.setItem('step' , '3');
      this.router.navigate(['/home']);
      
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
  private extractRatings(evalText: string) {
    try {
      const jsonStart = evalText.indexOf('{');
      const jsonEnd = evalText.lastIndexOf('}') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonString = evalText.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
      }
    } catch (e) {
      console.error('Failed to parse ratings JSON', e);
    }
    return {};
  }
  private saveMessages() {
    sessionStorage.setItem('voiceInterviewMessages', JSON.stringify(this.messages));
    sessionStorage.setItem('currentVoiceSectionIndex', this.currentSectionIndex.toString());
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

  private async playVoiceResponse(text: string) {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: 'alloy',
          input: text
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Disable mic while assistant is speaking
      this.isRecording = false;
      this.cdr.detectChanges();

      // Wait for playback to finish
      audio.onended = () => {
        console.log('🎤 Voice playback finished. Opening mic...');
        // Give a short delay before opening the mic
        setTimeout(() => {
          this.startRecording();
          this.cdr.detectChanges();
        }, 800);
      };

      await audio.play();
    } catch (err) {
      console.error('TTS playback error:', err);
      // If TTS fails, immediately start recording
      this.startRecording();
    }
  }



  proceedNext() {
    sessionStorage.setItem('step', '3');
    location.reload();
  }
}
