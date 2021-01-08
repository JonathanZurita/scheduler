import {Component, OnInit} from '@angular/core';
import {User} from './user.model';
import {UserService} from './user.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[];
  public person: string;
  public id: number;
  public personData: Array<any>;
  public inputValue: string;
  public personColor: string;
  public matrix: any;
  public colorObj: object;
  public initialized: boolean;
  public postId: any;
  public newUser: boolean;

  constructor(private userService: UserService, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.userService.getUsers$().subscribe(
      (userList: any[]) => this.users = userList
    );
  }

  handleInputChange(event): void {
    this.inputValue = event.target.value;
  }

  addUserNameOrForm(name): void {
    console.log(name);
    if (name !== undefined && name !== '') {
      document.getElementById('form').innerHTML = '';
      document.getElementById('user').innerHTML = `
      <div class="user"> User
        <div
          id="userName"
          style="color:${this.personColor};"
          > ${name}
        </div>
        <div style="padding-bottom: 5px;"></div>
      </div>
    `;
    }

  }

  addName(event): void {
    event.preventDefault();
    this.person = this.inputValue;
    // this.addUserNameOrForm(this.person);
  }

  getPersonData(): object {
    return this.personData;
  }

  // creates click events for each cell
  addClicks(data): void {
    const cells = document.getElementsByTagName(`td`);
    // add click events to each cell that toggles values
    for (let i = 0; i < cells.length; i++) {

      cells[i].addEventListener('click', (event) => {
        const row = cells[i].getAttribute('row');
        const col = cells[i].getAttribute('col');

        if (data[row][col] === false) {
          data[row][col] = true;
          this.matrix[row][col].push(this.person);
        } else {
          data[row][col] = false;
          for (let j = 0; j < this.matrix.length; j++) {
            if (this.matrix[row][col][j] === this.person) {
              this.matrix[row][col] = this.matrix[row][col].splice(j, 1);
            }
          }
        }
      });
    }

  }

  // ################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#################
  // #################################       POST REQUEST      #########################################
  // ###########################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@######################
  updateData(): void {
    const personObj = {
      name: this.person,
      color: this.colorObj[this.person],
    };
    const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeDataArray = [];

    let startTime;
    let counter = 0;
    // loop over the array starting with 0
    for (let i = 0; i < this.personData.length; i++) {
      for (let j = 0; j < this.personData[i].length; j++) {
        if (this.personData[i][j]) {
          // is this the first true?
          if (startTime === 0) {
            // tslint:disable-next-line:no-shadowed-variable
            let minutes = ':00';
            if (j % 2 === 1) {
              minutes = ':30';
            }
            startTime = Math.floor(j / 2 + 8) + minutes;
          }
          // increment the counter
          counter++;
        } else {
          // if counter has been initialized
          if (counter > 0) {
            let minutes = ':00';
            if (j % 2 === 1) {
              minutes = ':30';
            }
            // get the ending time slot and reset variables
            timeDataArray.push({
              dayOfTheWeek: daysOfTheWeek[i],
              workSlotStartTime: startTime,
              workSlotEndTime: Math.floor(j / 2 + 8) + minutes
            });
            startTime = 0;
            counter = 0;
          }
        }
      }
    }
    personObj[`timeSlots`] = timeDataArray;
    // if user already is in DB, do a patch instead
    if (this.newUser) {
      this.http.post<any>('https://jonathanvikas-schedule-project-api.apps.pcfepg3mi.gm.com/users', personObj).subscribe(
        data => this.postId = data.id
      );
    } else {
      this.http.patch<any>(`https://jonathanvikas-schedule-project-api.apps.pcfepg3mi.gm.com/users/${this.id}`, personObj).subscribe(
        data => this.postId = data
      );
    }
  }

  // #######################============================================##################################################################
  // ##################### maps over data to create HTML TABLE AND LEGEND ###################
  // ################################===============================########################################################
  mapData(personObj): void {
    var isNewPerson = true, names = '';
    if (this.person === undefined) {
      this.person = '';
    }
    if (this.personData === undefined) {
      this.personData = this.newDataSet();
    }
    // create matrix
    this.matrix = [];
    this.colorObj = {};
    for (let m = 0; m < 5; m++) {
      this.matrix.push([]);
      for (let a = 0; a < 20; a++) {
        this.matrix[m].push([]);
      }
    }


    // loops over each object in data array
    for (let i = 0; i < personObj?.length; i++) {
      const color = personObj[i].color;
      const data = personObj[i].timeSlots;
      const name = personObj[i].name;
      const id = personObj[i].id;
      this.colorObj[name] = color;
      let lastPerson = false;
      if (this.person === name) {
        this.personColor = color;
        this.id = id;
        isNewPerson = false;
      }
      // ###################################################################################
      // #####################     push timeslot data into matrix    ######################
      // #################################################################################
      if (name !== this.person || !this.initialized) {
        this.matrix = this.pushToMatrix(this.matrix, data, name, id);
      } else if (this.initialized) {
        for (let l = 0; l < 5; l++) {
          for (let y = 0; y < 20; y++) {
            if (this.personData[l][y] === true) {
              this.matrix[l][y].push(this.person);
            }
          }
        }
      }
      // check that we are on the last person in the data array
      if (i === personObj.length - 1) {
        lastPerson = true;
      }
      // add new data if a new person
      if (lastPerson && isNewPerson && !this.person) {
        this.getRandomNumber();
        this.personColor = `rgba(
          ${this.getRandomNumber()}, ${this.getRandomNumber()}, ${this.getRandomNumber()}, 0.8
        )`; // random color to be made later
        this.colorObj[this.person] = this.personColor;
      }
      // add person name to name legend
      if (name !== this.person) {
        names += `<div class="names" style="color:${color}" >` + name + `</div>`;
      }
    }
    // assign new person a color
    if (isNewPerson && this.person !== undefined) {
      this.colorObj[this.person] = this.personColor;
    }
    this.makeHtmlTable(this.matrix);
    // add the names to the legend
    document.getElementById('team').innerHTML = names;
    this.addUserNameOrForm(this.person);
    // add click events to the cells with individual persons data
    this.addClicks(this.personData);
  }

  // ###################################################################################
  // +_+_+__+_+__+_+_+_+_+__+_+_+_CREATE HTML TABLE +_+_+_+_+_+_+__+_+_+_+_+_+_+_+_+_ //
  // ###################################################################################
  makeHtmlTable(matrix): void {
    let dataTable =
      `<tr><th></th><th>Monday</th>` +
      `<th>Tuesday</th><th>Wednesday</th>` +
      `<th>Thursday</th><th>Friday</th></tr><tbody>`;
    for (let j = 0; j < 20; j++) {
      // make the time label on side of table
      let hour = Math.floor(j / 2) + 8;
      if (hour > 12) {
        hour -= 12;
      }
      let timeLabel: string;
      if (j % 2 === 1) {
        timeLabel = hour + `:30`;
      } else {
        timeLabel = hour + `:00`;
      }
      dataTable += `<tr><td class="time">${timeLabel}</td>`;
      for (let k = 0; k < 5; k++) {
        // assign the colors to html table data depending on how many people in each cell
        let cell = matrix[k][j], cellColor = 'none', cellNames = '';
        if (cell.length === 1) {
          cellColor = this.colorObj[cell[0]];
        } else if (cell.length > 1) {
          cellColor = 'rgb(52,52,42)';
          for (let z = 0; z < cell.length; z++) {
            cellNames += cell[z].charAt(0) + ' ';
            if (matrix[k][j][z] === this.person) {
              cellColor = this.colorObj[this.person];
              cellNames = cell.length.toString();

              break;
            }
          }
        }
        // create the table data html
        dataTable += `<td row=${k} col=${j} style="background-color:${cellColor};" >`
          + cellNames + `</td>`;
      } // finish the html row off
      dataTable += `</tr>`;
    }
    // finish of html table body for html string
    dataTable += '</tbody>';
    document.getElementById('schedule').innerHTML = dataTable;
  }

// ################################## DATA SET of BOOLEANS ########################3
  newDataSet(): Array<any> {
    const dataSet = [];
    for (let i = 0; i < 5; i++) {
      dataSet.push([]);
      for (let k = 0; k < 20; k++) {
        dataSet[i].push(false);
      }
    }
    return dataSet;
  }

  getRandomNumber(): number {
    return Math.floor(Math.random() * 255);
  }

  // #################################################################################
  // #####################CREATE MATRIX ##############################################
  // ################################################################################
  pushToMatrix(matrix, data, name, id): Array<any> {
    // initialize our current user/person data
    if (name === this.person) {
      this.initialized = true;
      this.newUser = false;
      this.id = id;
    }

    const dayObj = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4
    };
    // map over each day obj in the current users data
    for (let x = 0; x < data.length; x++) {
      // convert time into numbers
      var numOfSlots = 0;
      var start = [];
      var end = [];
      if (data[x].workSlotStartTime !== null) {
        start = data[x].workSlotStartTime.split(':');
      }
      var firstSlot = Number(start[0]) - 8;
      if (start[1] === '30') {
        firstSlot += .5;
      }
      firstSlot *= 2;
      if (data[x].workSlotEndTime !== null) {
        end = data[x].workSlotEndTime.split(':');
      }
      if (start[1] !== end[1]) {
        numOfSlots++;
      }
      numOfSlots += (Number(end[0]) - Number(start[0])) * 2;
      // add name if toggled true
      while (numOfSlots > 0) {
        matrix[dayObj[data[x].dayOfTheWeek]][firstSlot].push(name);
        if (this.person === name) {
          this.personData[dayObj[data[x].dayOfTheWeek]][firstSlot] = true;
        }
        firstSlot++;
        numOfSlots--;
      }
    }
    return matrix;
  }
}
