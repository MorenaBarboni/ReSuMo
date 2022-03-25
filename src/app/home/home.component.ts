import { Component, OnInit,Input, } from "@angular/core";
import { HomeService } from "../home.service";
import operators from "../../operators.config.json";
import config from "../../config";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog} from '@angular/material/dialog';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})

export class HomeComponent implements OnInit {

  map = new Map<string, boolean>();
  pathMap = new Map<string, string>();
  form: FormGroup;
  visualCheckBox = [{ id: 0, name: "" }];
  ACM: any;
  AOR: any;
  BCRD: any;
  BLR: any;
  BOR: any;
  CBD: any;
  CSC: any;
  ECS: any;
  ER: any;
  HLR: any;
  ICM: any;
  ILR: any;
  LSC: any;
  OLFD: any;
  ORFD: any;
  SKD: any;
  SKI: any;
  SLR: any;
  UORD: any;
  AVR: any;
  CCD: any;
  DLR: any;
  DOD: any;
  EED: any;
  EHC: any;
  ETR: any;
  FVR: any;
  GVR: any;
  MCR: any;
  MOC: any;
  MOD: any;
  MOI: any;
  MOR: any;
  OMD: any;
  PKD: any;
  RSD: any;
  RVS: any;
  SCEC: any;
  SFI: any;
  SFD: any;
  SFR: any;
  TOR: any;
  VUR: any;
  VVR: any;
  showFiller = false;
  title = "SuMo-GUI";
  value = `Welcome to SuMo - Solidity Mutator - Set the right path in the Setting section,\n\n
activate the operators that you prefer in the Operators session and come back here to test\n\n
your solidity program! 🥳 🤼          \n\n\n
    ..=====.. |==|
    ||     || |= |
 _  ||     || |^*| _
|=| o=,===,=o |__||=|
|_|  _______)~\`)  |_|
    [=======]  ()     `;
  checkOperator = false;
  allSolidityToggle = false;
  allGeneralToggle = false;
  allSumoToggle = false;
  sumoDir: any;
  projectPath: any;
  contractsPath: any;
  testPath: any;
  compiledPath: any;
  ignorePath: any;
  tceActived = false;
  ganacheActived = false;
  personalTestActived = false;
  optimizedActived = false;
  regressionTestingActived = false;
  setTimeOutInSec: any;
  constructor(protected homeservice: HomeService, private formBuilder: FormBuilder, protected snackbar: MatSnackBar, private  dialog: MatDialog) {
    this.form = this.formBuilder.group({
      orders: new FormArray([])
    });

  }

  ngOnInit(): void {
    this.optimizedActived = config.optimized;
    this.tceActived = config.tce;
    this.ganacheActived = config.ganache;
    this.personalTestActived = config.customTestScript;
    this.sumoDir = config.absoluteSumoDir;
    this.projectPath = config.targetDir;
    this.contractsPath = config.contractsDir;
    this.testPath = config.testDir;
    this.compiledPath = config.compiledDir;
    this.setTimeOutInSec=config.testingTimeOutInSec;
    this.regressionTestingActived = config.regressionTestingActived;
    this.ignorePath = config.ignore;

    this.map.set("ACM", operators.ACM);
    this.map.set("AOR", operators.AOR);
    this.map.set("BCRD", operators.BCRD);
    this.map.set("BLR", operators.BLR);
    this.map.set("BOR", operators.BOR);
    this.map.set("CBD", operators.CBD);
    this.map.set("CSC", operators.CSC);
    this.map.set("ECS", operators.ECS);
    this.map.set("ER", operators.ER);
    this.map.set("HLR", operators.HLR);
    this.map.set("ICM", operators.ICM);
    this.map.set("ILR", operators.ILR);
    this.map.set("LSC", operators.LSC);
    this.map.set("OLFD", operators.OLFD);
    this.map.set("ORFD", operators.ORFD);
    this.map.set("SKD", operators.SKD);
    this.map.set("SKI", operators.SKI);
    this.map.set("SLR", operators.SLR);
    this.map.set("UORD", operators.UORD);
    this.map.set("AVR", operators.AVR);
    this.map.set("CCD", operators.CCD);
    this.map.set("DLR", operators.DLR);
    this.map.set("DOD", operators.DOD);
    this.map.set("EED", operators.EED);
    this.map.set("EHC", operators.EHC);
    this.map.set("ETR", operators.ETR);
    this.map.set("FVR", operators.FVR);
    this.map.set("GVR", operators.GVR);
    this.map.set("MCR", operators.MCR);
    this.map.set("MOC", operators.MOC);
    this.map.set("MOD", operators.MOD);
    this.map.set("MOI", operators.MOI);
    this.map.set("MOR", operators.MOR);
    this.map.set("OMD", operators.OMD);
    this.map.set("PKD", operators.PKD);
    this.map.set("RSD", operators.RSD);
    this.map.set("RVS", operators.RVS);
    this.map.set("SCEC", operators.SCEC);
    this.map.set("SFI", operators.SFI);
    this.map.set("SFD", operators.SFD);
    this.map.set("SFR", operators.SFR);
    this.map.set("TOR", operators.TOR);
    this.map.set("VUR", operators.VUR);
    this.map.set("VVR", operators.VVR);
    this.ACM = this.map.get("ACM");
    this.AOR = this.map.get("AOR");
    this.BCRD = this.map.get("BCRD");
    this.BLR = this.map.get("BLR");
    this.BOR = this.map.get("BOR");
    this.CBD = this.map.get("CBD");
    this.CSC = this.map.get("CSC");
    this.ECS = this.map.get("ECS");
    this.ER = this.map.get("ER");
    this.HLR = this.map.get("HLR");
    this.ICM = this.map.get("ICM");
    this.ILR = this.map.get("ILR");
    this.LSC = this.map.get("LSC");
    this.OLFD = this.map.get("OLFD");
    this.ORFD = this.map.get("ORFD");
    this.SKD = this.map.get("SKD");
    this.SKI = this.map.get("SKI");
    this.SLR = this.map.get("SLR");
    this.UORD = this.map.get("UORD");
    this.AVR = this.map.get("AVR");
    this.CCD = this.map.get("CCD");
    this.DLR = this.map.get("DLR");
    this.DOD = this.map.get("DOD");
    this.EED = this.map.get("EED");
    this.EHC = this.map.get("EHC");
    this.ETR = this.map.get("ETR");
    this.FVR = this.map.get("FVR");
    this.GVR = this.map.get("GVR");
    this.MCR = this.map.get("MCR");
    this.MOC = this.map.get("MOC");
    this.MOD = this.map.get("MOD");
    this.MOI = this.map.get("MOI");
    this.MOR = this.map.get("MOR");
    this.OMD = this.map.get("OMD");
    this.PKD = this.map.get("PKD");
    this.RSD = this.map.get("RSD");
    this.RVS = this.map.get("RVS");
    this.SCEC = this.map.get("SCEC");
    this.SFI = this.map.get("SFI");
    this.SFD = this.map.get("SFD");
    this.SFR = this.map.get("SFR");
    this.TOR = this.map.get("TOR");
    this.VUR = this.map.get("VUR");
    this.VVR = this.map.get("VVR");
  }

  //Methods used in our Home
  /**
   * The <b>clean()</b> method is linked to the 'clean' button and permits to delete the '.sumo' dir
   */
  async clean() {
    this.value = "Cleaning '.sumo' dir...";
    return this.homeservice.clear().subscribe((data: string) => {
      this.value = data;
    });
  }
  /*async deleteResume(){
    this.value = "Cleaning '.resume' dir...";
    return this.homeservice.deleteResume().subscribe((data: string) => {
      this.value = data;
    });
  }*/

  async openDialog(){
      const dialogRef = this.dialog.open(dialogComponent);
      dialogRef.afterClosed().subscribe(result => {

      });
  }
  async closeDialog(){
    this.dialog.closeAll()
  }

  /**
   * The <b>preflight()</b> method is linked to the 'preflight' button and permits to run the preflight command in 'home.service.ts'
   */
  async preflight() {
    return this.homeservice.preflight().subscribe((data: string) => {
      this.value = data;
    });
  }

/**
 * The <b>mutate()</b> method is linked to the 'mutate' button and permits to run the mutate command in 'home.service.ts'
 */
  async mutate() {
    this.value = "Applying mutations...";
    return this.homeservice.mutate().subscribe((data: string) => {
      this.value = data;
    });
  }

  /**
   * The <b>test()</b> method is linked to the 'test' button and permits to run the test command in 'home.service.ts'
   */
  async test() {
    this.value = "Running test...";
    return this.homeservice.test().subscribe((data: string) => {
      this.value = data;
    });
  }

  /**
   * The <b>restore()</b> method is linked to the 'restore' button and permits to run the restore command in 'home.service.ts'
   */
  async restore() {
    return this.homeservice.restore().subscribe((data: string) => {
      this.value = data;
    });
  }



  //Methods used in our Setting
  /**
   * The <b>saveSetting()</b> method is linked to the 'Save setting' button and permits to save the changes made in the GUI to the SuMo 'config.js' file
   */
  async saveSetting() {
    this.buildIgnorePath();
    if (this.tceActived) {
      this.snackbar.open("Attenction TCE Actived! 💻", "DONE", {
        duration: 3000
      });
    }
    this.homeservice.saveOptions(this.sumoDir, this.projectPath, this.contractsPath, this.testPath, this.compiledPath, this.ignorePath, this.ganacheActived, this.optimizedActived, this.tceActived, this.personalTestActived, this.regressionTestingActived, this.setTimeOutInSec);
  }

  /**
   * The <b>setMap()</b> method graphically save the changes made on the operators
   * @private
   */
  private setMap() {
    this.map.set("ACM", this.ACM);
    this.map.set("AOR", this.AOR);
    this.map.set("BCRD", this.BCRD);
    this.map.set("BLR", this.BLR);
    this.map.set("BOR", this.BOR);
    this.map.set("CBD", this.CBD);
    this.map.set("CSC", this.CSC);
    this.map.set("ECS", this.ECS);
    this.map.set("ER", this.ER);
    this.map.set("HLR", this.HLR);
    this.map.set("ICM", this.ICM);
    this.map.set("ILR", this.ILR);
    this.map.set("LSC", this.LSC);
    this.map.set("OLFD", this.OLFD);
    this.map.set("ORFD", this.ORFD);
    this.map.set("SKD", this.SKD);
    this.map.set("SKI", this.SKI);
    this.map.set("SLR", this.SLR);
    this.map.set("UORD", this.UORD);
    this.map.set("AVR", this.AVR);
    this.map.set("CCD", this.CCD);
    this.map.set("DLR", this.DLR);
    this.map.set("DOD", this.DOD);
    this.map.set("EED", this.EED);
    this.map.set("EHC", this.EHC);
    this.map.set("ETR", this.ETR);
    this.map.set("FVR", this.FVR);
    this.map.set("GVR", this.GVR);
    this.map.set("MCR", this.MCR);
    this.map.set("MOC", this.MOC);
    this.map.set("MOD", this.MOD);
    this.map.set("MOI", this.MOI);
    this.map.set("MOR", this.MOR);
    this.map.set("OMD", this.OMD);
    this.map.set("PKD", this.PKD);
    this.map.set("RSD", this.RSD);
    this.map.set("RVS", this.RVS);
    this.map.set("SCEC", this.SCEC);
    this.map.set("SFI", this.SFI);
    this.map.set("SFD", this.SFD);
    this.map.set("SFR", this.SFR);
    this.map.set("TOR", this.TOR);
    this.map.set("VUR", this.VUR);
    this.map.set("VVR", this.VVR);
  }

  /**
   The <b>showContracts()</b> is linked to the 'show contracts' button and permits to show all contracts and select those to ignore
   */
  async showContracts() {
    return this.homeservice.showContracts(this.contractsPath).subscribe((data: string) => {
      this.splitPath(data);
    });
  }

  /**
   * The <b>splitPath()</b> provides to split contracts' path in order to show to the user all contracts in project directories.
   * @param path Full path of contracts
   * @private
   */
  private splitPath(path: string) {
    this.pathMap.clear();
    this.visualCheckBox = [{ id: 0, name: "" }];
    this.ordersFormArray.clear();
    let fullPath = path.split(",");
    for (let index = 0; index < fullPath.length; index++) {
      if (fullPath[index] !== "") {
        if (path.includes("/"))
          this.pathMap.set(fullPath[index].substring(fullPath[index].lastIndexOf("/") + 1), fullPath[index]);
        else
          this.pathMap.set(fullPath[index].substring(fullPath[index].lastIndexOf("\\") + 1), fullPath[index]);
      }
    }
    this.addToArray();
  }

  /**
   *
   * @private
   */
  private addToArray() {
    this.visualCheckBox.pop();
    let i: number;
    i = 1;
    for (let elem of this.pathMap.keys()) {
      this.visualCheckBox.push({ id: i, name: elem });
      i++;
    }
    this.addCheckboxesToForm();
  }

  /**
   *
   * @private
   */
  private addCheckboxesToForm() {
    var bool = true;
    for (let i = 0; i < this.visualCheckBox.length; i++) {
      for (let j = 0; j < config.ignore.length; j++) {
        if (this.visualCheckBox[i].name === "file not found" || this.visualCheckBox[i].name === "File not found") {
          this.snackbar.open("Files not found! 😢", "DONE", {
            duration: 3000
          });
          return;
        }
        if (this.visualCheckBox[i].name === config.ignore[j].substring(config.ignore[j].lastIndexOf("/") + 1)) {
          bool = true;
          break;
        } else {
          bool = false;
        }
      }
      this.ordersFormArray.push(new FormControl(bool));
    }
  }

  get ordersFormArray() {
    return this.form.controls["orders"] as FormArray;
  }

  /**
   * The <b>buildIgnorepath()</b> method is used to recreate the path of the contracts which should be ignored
   * @private
   */
  private buildIgnorePath() {
    const selectedContracts = this.form.value.orders
      .map((checked: any, i: number) => checked ? this.visualCheckBox[i].name : null)
      .filter((v: any) => v !== null);
    this.ignorePath = "";
    for (let contract of selectedContracts) {
      this.ignorePath = this.ignorePath.concat(this.pathMap.get(contract) + ",");
    }
    this.ignorePath = this.ignorePath.substring(0, this.ignorePath.length - 1).replaceAll("\\", "/");
  }


  //Methods used in our Operators
  /**
   * Enable/disable all general General operators
   */
  async allGeneral() {
    if (!this.allGeneralToggle) {
      this.ACM = true;
      this.AOR = true;
      this.BCRD = true;
      this.BLR = true;
      this.BOR = true;
      this.CBD = true;
      this.CSC = true;
      this.ECS = true;
      this.ER = true;
      this.HLR = true;
      this.ICM = true;
      this.ILR = true;
      this.LSC = true;
      this.OLFD = true;
      this.ORFD = true;
      this.SKD = true;
      this.SKI = true;
      this.SLR = true;
      this.UORD = true;
      this.allGeneralToggle = true;


    } else {
      this.ACM = false;
      this.AOR = false;
      this.BCRD = false;
      this.BLR = false;
      this.BOR = false;
      this.CBD = false;
      this.CSC = false;
      this.ECS = false;
      this.ER = false;
      this.HLR = false;
      this.ICM = false;
      this.ILR = false;
      this.LSC = false;
      this.OLFD = false;
      this.ORFD = false;
      this.SKD = false;
      this.SKI = false;
      this.SLR = false;
      this.UORD = false;
      this.allGeneralToggle = false;

    }
  };

  /**
   * Enable/disable all Solidity operators
   */
  async allSolidity() {
    if (!this.allSolidityToggle) {
      this.AVR = true;
      this.CCD = true;
      this.DLR = true;
      this.DOD = true;
      this.EED = true;
      this.EHC = true;
      this.ETR = true;
      this.FVR = true;
      this.GVR = true;
      this.MCR = true;
      this.MOC = true;
      this.MOD = true;
      this.MOI = true;
      this.MOR = true;
      this.OMD = true;
      this.PKD = true;
      this.RSD = true;
      this.RVS = true;
      this.SCEC = true;
      this.SFI = true;
      this.SFD = true;
      this.SFR = true;
      this.TOR = true;
      this.VUR = true;
      this.VVR = true;
      this.allSolidityToggle = true;

    } else {
      this.AVR = false;
      this.CCD = false;
      this.DLR = false;
      this.DOD = false;
      this.EED = false;
      this.EHC = false;
      this.ETR = false;
      this.FVR = false;
      this.GVR = false;
      this.MCR = false;
      this.MOC = false;
      this.MOD = false;
      this.MOI = false;
      this.MOR = false;
      this.OMD = false;
      this.PKD = false;
      this.RSD = false;
      this.RVS = false;
      this.SCEC = false;
      this.SFI = false;
      this.SFD = false;
      this.SFR = false;
      this.TOR = false;
      this.VUR = false;
      this.VVR = false;
      this.allSolidityToggle = false;
    }
  };

  /**
   * Save the changes made into the
   */
  async saveOperatorSettings() {
    const map2 = new Map(this.map);
    this.setMap();
    this.value = "Operators changed: \n";
    for (let key of this.map.keys()) {
      if (this.map.get(key) !== map2.get(key)) {
        if (this.map.get(key) === true) {
          this.value = this.value.concat(key + " -> enabled \n");
          this.homeservice.enableOperator(key);
        } else if (this.map.get(key) === false) {
          this.value = this.value.concat(key + " -> disabled \n");
          this.homeservice.disableOperator(key);
        }
      }
    }
  }
}
@Component({
  selector: 'dialogComponent',
  templateUrl: './home.dialog.html',
})
export class dialogComponent extends HomeComponent {
  async deleteResume(){
    this.value = "Cleaning '.resume' dir...";
    return this.homeservice.deleteResume().subscribe((data: string) => {
      this.value = "Sumo dir deleteddddddd";
      this.closeDialog()
      this.snackbar.open(".resume directory deleted","Done!")
    });

  }
}





