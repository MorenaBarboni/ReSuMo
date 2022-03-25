import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})

export class HomeService {
  private headers = new HttpHeaders({ "Access-Control-Allow-Origin": "*" });
  private url = "http://localhost:8000";

  constructor(private http: HttpClient) {

  }

  /**
   * <b>clear()</b> is a post request through "http://localhost:8000/clean" url
   * and it expects a text response
   */
  public clear(): Observable<any> {
    return this.http.post(this.url + "/clean", null, { headers: this.headers, responseType: "text" });
  }
  public deleteResume(): Observable<any> {
    return this.http.post(this.url + "/deleteResume", null, { headers: this.headers, responseType: "text" });
  }

  /**
   * <b>preflight()</b> is a post request through "http://localhost:8000/preflight" url
   * and it expects a text response
   */
  public preflight(): Observable<any> {
    return this.http.post(this.url + "/preflight", null, { headers: this.headers, responseType: "text" });
  }

  /**
   * <b>mutate()</b> is a post request through "http://localhost:8000/mutate" url
   * and it expects a text response
   */
  public mutate(): Observable<any> {
    return this.http.post(this.url + "/mutate", null, { headers: this.headers, responseType: "text" });
  }

  /**
   * <b>test</b> is a post request through "http://localhost:8000/test" url
   * and it expects a text response
   */
   public  test(): Observable<any> {
    return this.http.post(this.url + "/test", null, { headers: this.headers, responseType: "text" });
   }
  /**
   * <b>restore()</b> is a post request through "http://localhost:8000/restore" url
   * and it expects a text response
   */
  public restore(): Observable<any> {
    return this.http.post(this.url + "/restore", null, { headers: this.headers, responseType: "text" });
  }

  /**
   * <b>enableOperator()</b> is a post request through "http://localhost:8000/enableOperator:OperatorID" url
   */
  public enableOperator(oper: any) {
    this.http.post<any>(this.url + "/enableOperator" + oper, null).subscribe();
  }

  /**
   * <b>disableOperator</b> is a post request through "http://localhost:8000/disableOperator:OperatorID"
   */
  public disableOperator(oper: any) {
    this.http.post<any>(this.url + "/disableOperator" + oper, null).subscribe();
  }

  /**
   * <b>getReport()</b> is a get request through "http://localhost:8000/getReport" url
   * and it expects a text response
   */
  public getReport(): Observable<any> {
    return this.http.get(this.url + "/getReport", { headers: this.headers, responseType: "text" });
  }

  /**
   * <b>getRregressionReport()</b> is a get request through "http://localhost:8000/getRegressionReport" url
   * and it expects a text response
   */
  public getRegressionReport(): Observable<any> {
    return this.http.get(this.url + "/getRegressionReport", { headers: this.headers, responseType: "text" });
  }

  public getCSVReport(): Observable<any>  {
    return this.http.get(this.url + "/getCSVReport", { headers: this.headers, responseType: "text" });
  }

  public getOperatorsReport(): Observable<any>{
    return this.http.get(this.url+"/getOperatorsReport", { headers: this.headers, responseType: "text" });
  }

  /**
   * <b>showContract</b> is a get request through "http://localhost:8000/getIgnores?path=PathVALUE" url
   * @param path The path of the contracts directory
   */
  public showContracts(path: any): Observable<any> {
    return this.http.get(this.url + "/getIgnores?path=" + path, { headers: this.headers, responseType: "text" });
  }

  /**
   *<b>saveOptions</b> is a post request through "http://loacalhost:8000/saveOptions?absoluteSumDir=PathVALUE&"
   * @param absoluteSumoDir Main directory of SuMo framework
   * @param targetDir Main directory of the project under test
   * @param contractsDir Contracts directory of the project under test
   * @param testDir Test directory of the project under test
   * @param compiledDir Directory of the compiled contracts
   * @param ignore Path of the contracts to ignore
   * @param ganache Check to use ganache or not
   * @param optimized Check to use optimize or not
   * @param tce Check to use tce or not
   * @param customTestScript Check to use customTestScript or not
   * @param regrTest Check to use Regression Testing or not
   * @param testingTimeOutInSec TimeOut to use during testing process
   */
  public saveOptions(absoluteSumoDir: any, targetDir: any, contractsDir: any, testDir: any, compiledDir: any, ignore: any, ganache: boolean, optimized: boolean, tce: boolean, customTestScript: boolean,regrTest:boolean, testingTimeOutInSec: any) {
    this.http.post<any>(this.url + "/saveOptions?" + "absoluteSumoDir=" + absoluteSumoDir + "&targetDir=" + targetDir + "&contractsDir=" + contractsDir + "&testDir=" + testDir + "&compiledDir=" + compiledDir + "&ignore=" + ignore + "&ganache=" + ganache + "&optimized=" + optimized + "&tce=" + tce + "&customTestScript=" + customTestScript  + "&regrTest=" + regrTest +"&testingTimeOutInSec=" + testingTimeOutInSec , null).subscribe();
  }




}
