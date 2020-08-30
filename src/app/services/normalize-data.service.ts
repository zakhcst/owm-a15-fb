import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NormalizeDataService {

  constructor() { }
  
  ip(ip: string) {
    if (typeof ip !== 'string') {
      ip = '--ip';
    }
    const dashedIp = ip.replace(/\.|\:/g, '-');
    return dashedIp;
  }

}
