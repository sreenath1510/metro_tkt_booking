import { Component } from "@angular/core";
import { BookingService } from "./booking.service";
import * as moment from "moment";

@Component({
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.css"],
})
export class BookingComponent {
  // Dropdown Arrays
  travelTypes: string[] = ["Journey", "Return"];
  paymentTypes: string[] = ["Cash", "Card"];
  stationsList: string[] = this.bookingService.stationsList;

  // User Selected Variables
  selectedTravel: string = this.travelTypes[0];
  selectedPaymentType: string = this.paymentTypes[0];
  source = "";
  destination = "";
  startTime = "08:00";
  endTime = "";

  // Ticket Summary Variables
  cardBalance = 200;
  ticketFare!: number;
  ticketFareWithoutDiscount!: number;
  discount1 = 0;
  discount2 = 0;

  // Additional Flags
  showDetails = false;
  errorMsg = "";

  constructor(private readonly bookingService: BookingService) {}

  // On Click of "Get Fare" Button
  getFare() {
    if (this.validate()) {
      this.errorMsg = "";
      this.ticketFare = this.getBaseFare();
      // Checking price for Return Journey
      if (this.checkReturn()) {
        this.ticketFare = this.ticketFare * 2;
      }
      this.ticketFareWithoutDiscount = this.ticketFare;
      // Card Logic
      if (this.selectedPaymentType === "Card") {
        this.ticketFare = this.checkDiscounts(this.ticketFare);
      }
      this.showDetails = true;
    }
  }

  // Ticket Fare for a Single Journey
  // Logic -- After every 3 stations, each station is 10 and Max price is 50
  getBaseFare(): number {
    const srcIndex = this.stationsList.indexOf(this.source);
    const destIndex = this.stationsList.indexOf(this.destination);
    const noOfStations = Math.abs(destIndex - srcIndex) + 1; // +1 is bcz of index starts from 0
    let fare: number = 10;
    if (noOfStations > 3) {
      fare = 10 + (noOfStations - 3) * 10;
    }
    return fare > 50 ? 50 : fare;
  }

  // Discount Logic
  checkDiscounts(fare: number): number {
    this.discount1 = fare * 0.2; // 20% Discount
    if (this.checkReturn() && this.timeDifference()) {
      this.discount2 = fare * 0.05; // 5% Discount
      fare -= this.discount2;
    } else {
      this.discount2 = 0;
    }
    fare -= this.discount1;
    return fare;
  }

  // Called by discount check and validation (improper time selection)
  timeDifference(isDiscountCheck = true): boolean {
    const start = moment(this.startTime, "HH:mm");
    const end = moment(this.endTime, "HH:mm");
    const durationInMinutes = moment.duration(end.diff(start)).asMinutes();
    return isDiscountCheck
      ? durationInMinutes <= 360 // 6hrs = 6 * 60 = 360 mins
      : !(durationInMinutes > 0);
  }

  // Validations
  validate(): boolean {
    if (
      !this.bookingService.isValueProper(this.source) &&
      !this.bookingService.isValueProper(this.destination)
    ) {
      this.errorMsg = "(Please select Source and Destination)";
      return false;
    }
    if (this.source === this.destination) {
      this.errorMsg = "(Source and Destination cannot be same)";
      return false;
    }
    if (this.cardBalance < 50) {
      this.errorMsg =
        "(Please recharge your card with a minimum balance of 50)";
      return false;
    }
    if (this.isTypeCard() && !this.checkReturn()) {
      this.discount2 = 0;
    } else if (this.isTypeCard() && this.timeDifference(false)) {
      this.errorMsg = "(Please provide proper start and end time)";
      return false;
    }
    return true;
  }

  // On Click of "Pay" Button
  pay() {
    if (this.isTypeCard()) {
      this.cardBalance -= this.ticketFare;
    }
    this.showDetails = false;
  }

  // Checks Travel Type
  checkReturn(): boolean {
    return this.selectedTravel === "Return";
  }

  // Checks Card Type
  isTypeCard(): boolean {
    return this.selectedPaymentType === "Card";
  }
}
