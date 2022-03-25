import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import {HomeService} from "../home.service";
type AOA = any[][];
type AOA2 = any [][];
@Component({
  selector: 'app-csv-viewer',
  templateUrl: './csv-viewer.component.html',
  styleUrls: ['./csv-viewer.component.css']
})
export class CsvViewerComponent implements OnInit {

  constructor(private homeservice: HomeService) {

  }

  ngOnInit(): void {
    this.openReport()
    this.openRegressionReport()
    this.getCSV()
    this.openOperatorsReport()
  }

  data: AOA = [];
  data2: AOA2 = [[], []]
  evt:any

  valueReport = ''
  valueRegression = ''

  getCSV() {
    return this.homeservice.getCSVReport().subscribe((data: string) => {
      const wb: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    });
  }


  /**
   * The <b>openReport()</b> method is linked to the 'Show Mutation Report' button and permits to print the SuMo 'report.txt' into the GUI terminal
   */
  openReport() {
    return this.homeservice.getReport().subscribe((data: string) => {
      this.valueReport = data;
    });
  }

  /**
   * The <b>openRegressionReport()</b> method is linked to the 'Show Regression Report' button and permits to print the ReSuMe 'report.txt' into the GUI terminal
   */
  openRegressionReport() {
    return this.homeservice.getRegressionReport().subscribe((data: string) => {
      this.valueRegression = data;
    });
  }

  openOperatorsReport(){
    return this.homeservice.getOperatorsReport().subscribe((data:string)=>{
      const wb: XLSX.WorkBook = XLSX.read(data,{type:'binary'});
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data2 = <AOA2>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    })
  }
}

