import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class BookingService {
  stationsList: string[] = [];

  constructor() {
    for (let i = 0; i < 25; i++) {
      this.stationsList.push(String.fromCharCode(i + 65));
    }
  }

  isValueProper(value: any): boolean {
    if (typeof value === "string" || value instanceof String) {
      if (value !== undefined && value !== null && value !== "") {
        return true;
      }
    } else if (value instanceof Array) {
      if (value !== undefined && value !== null && value.length !== 0) {
        return true;
      }
    } else {
      if (value !== undefined && value !== null) {
        return true;
      }
    }
    return false;
  }
}
