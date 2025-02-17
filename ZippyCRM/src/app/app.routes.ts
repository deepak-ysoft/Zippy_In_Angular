import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { IndexComponent } from './Components/index/index.component';
import { UserRegisterComponent } from './Components/User/user-register/user-register.component';
import { UserProfileComponent } from './Components/User/user-profile/user-profile.component';
import { UserProfileNeedHelpComponent } from './Components/User/user-profile-need-help/user-profile-need-help.component';
import { UserForgotPasswordComponent } from './Components/User/user-forgot-password/user-forgot-password.component';
import { UserResetPasswordComponent } from './Components/User/user-reset-password/user-reset-password.component';
import { CustomerRegisterComponent } from './Components/Customer/customer-register/customer-register.component';
import { CustomerListComponent } from './Components/Customer/customer-list/customer-list.component';
import { CustomerProfileComponent } from './Components/Customer/CustomerProfile/customer-profile/customer-profile.component';
import { CusContactComponent } from './Components/Customer/CustomerProfile/cus-contact/cus-contact.component';
import { CustomerDetailsComponent } from './Components/Customer/customer-details/customer-details.component';
import { ContactUsComponent } from './Components/ContactUs/contact-us/contact-us.component';
import { ContactUsListComponent } from './Components/ContactUs/contact-us-list/contact-us-list.component';
import { ShowNotificationPopupComponent } from './Components/ContactUs/show-notification-popup/show-notification-popup.component';
import { ChatComponent } from './Components/User/chat/chat.component';
import { JoinRoomComponent } from './Components/User/join-room/join-room.component';
import { DirectMessageComponent } from './Components/User/direct-message/direct-message.component';
import { authGuard } from './Services/auth.service';

export const routes: Routes = [
  {
    path: 'user-forgot-password',
    component: UserForgotPasswordComponent,
  },
  {
    path: 'user-reset-password',
    component: UserResetPasswordComponent,
  },
  {
    path: 'user-register',
    component: UserRegisterComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'index', // Redirect '' within LayoutComponent to 'index'
        pathMatch: 'full',
      },
      {
        path: 'index',
        component: IndexComponent,
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [authGuard],
      },
      {
        path: 'user-profile-need-help',
        component: UserProfileNeedHelpComponent,
        canActivate: [authGuard],
      },
      {
        path: 'customer-register',
        component: CustomerRegisterComponent,
        canActivate: [authGuard],
      },
      {
        path: 'customer-list',
        component: CustomerListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'customer-details',
        component: CustomerDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'customer-profile',
        component: CustomerProfileComponent,
        canActivate: [authGuard],
      },
      {
        path: 'customer-contact',
        component: CusContactComponent,
        canActivate: [authGuard],
      },
      {
        path: 'contact-us-list',
        component: ContactUsListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'contact-us-details',
        component: ShowNotificationPopupComponent,
        canActivate: [authGuard],
      },
      {
        path: 'contact-us',
        component: ContactUsComponent,
      },
      {
        path: 'direct-message-user',
        component: DirectMessageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'chat-with-user',
        component: ChatComponent,
        canActivate: [authGuard],
      },
      {
        path: 'join-chat',
        component: JoinRoomComponent,
        canActivate: [authGuard],
      },
    ],
  }, //defualt route
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];
