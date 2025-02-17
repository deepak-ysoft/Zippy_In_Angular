import { Component, inject, OnInit } from '@angular/core';
import { Customer } from '../../../Models/customer.model';
import { Router, RouterLink } from '@angular/router';
import { CustomerServiceService } from '../../../Services/customerService/customer-service.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css',
})
export class CustomerDetailsComponent implements OnInit {
  customer!: Customer;
  cusService = inject(CustomerServiceService);
  router = inject(Router);

  ngOnInit(): void {
    const state = window.history.state; // Retieve data from window history

    if (state && state.customer) {
      this.customer = state.customer;
    }
  }

  // get customer profile by customer id
  getCustomerProfile(customerId: any) {
    this.cusService.getCustomerProfile(customerId).subscribe((res: any) => {
      this.customer = res;
      if (res != null) {
        // if result is not empty then navigate to customer profile
        this.router.navigate(['customer-profile'], {
          state: { customer: this.customer },
        });
      }
    });
  }
}
