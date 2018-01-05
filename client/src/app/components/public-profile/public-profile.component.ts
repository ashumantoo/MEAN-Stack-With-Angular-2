import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

  currentUrl;
  username;
  email;
  foundProfile = false;
  message;
  messageClass;

  constructor(
    private authService: AuthService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUrl = this.activeRoute.snapshot.params;
    this.authService.getPublicProfile(this.currentUrl.username).subscribe(data => {
      if (!data.success) {
        this.messageClass = "alert alert-danger";
        this.message = data.message;
      } else {
        this.foundProfile = true;
        this.username = data.user.username;
        this.email = data.user.email;
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
    });
  }

}
