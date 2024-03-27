import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, StatusBar} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome'
import Dialog from 'react-native-dialog';
import uuid from 'uuid-random'; // Import uuid-random for generating UUIDs
import DateTimePicker from '@react-native-community/datetimepicker';

const App = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(Platform.OS === 'ios' ? true : false);
    if (selectedDate) {
      setFromDate(selectedDate);
      setFilters({ ...filters, fromDate: selectedDate });
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(Platform.OS === 'ios' ? true : false);
    if (selectedDate) {
      setToDate(selectedDate);
      setFilters({ ...filters, toDate: selectedDate });
    }
  };

  const clearFromDate = () => {
    setFromDate(new Date());
    setFilters({ ...filters, fromDate: null });
  };

  const clearToDate = () => {
    setToDate(new Date());
    setFilters({ ...filters, toDate: null });
  };
  
  const handleAdd = () => {
    // Handle the request logic here
    addTask();
    setDialogOpen(false);
  };

  const [pp, setPp] = useState('High');

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: null,
    status: 'In Progress',
    team: '',
    assignees: '',
    priority: 'P2',
  });

  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
    assignees: '',
    priority: '',
    search: '', // New search filter
  });

  const addTask = () => {
    const taskToAdd = { ...newTask, id: uuid() }; // Assign a unique ID to the task
    if (taskToAdd.status === 'Completed') {
      taskToAdd.endDate = new Date(); // Set end date if status is Completed
    }
    setTasks([...tasks, taskToAdd]);
    setNewTask({
      title: '',
      description: '',
      startDate: new Date(),
      endDate: null,
      status: 'In Progress',
      team: '',
      assignees: '',
      priority: 'P2',
    });
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          endDate: newStatus === 'Completed' ? new Date() : task.endDate,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handlePriorityChange = (taskId, newPriority) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          priority: newPriority
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId); // Filter out the task with the given ID
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(task => {
    let includeTask = true;
    // Filter by date range
    if (filters.fromDate && task.startDate < filters.fromDate) {
      includeTask = false;
    }
    if (filters.toDate && task.startDate > filters.toDate) {
      includeTask = false;
    }

    // Filter by assignees
    if (filters.assignees && task.assignees !== filters.assignees) {
      includeTask = false;
    }

    // Filter by priority
    if (filters.priority && task.priority !== filters.priority) {
      includeTask = false;
    }

    // New search filter: check if any word in the search string matches any task property
    if (filters.search) {
      const searchWords = filters.search.toLowerCase().split(/\s+/);
      const taskString = `${task.title.toLowerCase()} ${task.description.toLowerCase()} ${task.team.toLowerCase()} ${task.assignees.toLowerCase()} ${task.priority.toLowerCase()} ${task.status.toLowerCase()}`;
      includeTask = searchWords.every(word => taskString.includes(word));
    }

    return includeTask;
  }).sort((a, b) => {
    let priorityOrder;
    pp === 'high' ? priorityOrder = { P2: 0, P1: 1, P0: 2 } : priorityOrder = { P0: 0, P1: 1, P2: 2 }

    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Group tasks by status
  const tasksByStatus = {
    'In Progress': [],
    'Pending': [],
    'Deployed': [],
    'Deferred': [],
    'Completed': []
  };

  filteredTasks.forEach(task => {
    tasksByStatus[task.status].push(task);
  });

  const handleStatusSelectChange = (taskId, newStatus) => {
    handleTaskStatusChange(taskId, newStatus);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Progress':
        return styles.inProgress;
      case 'Completed':
        return styles.completed;
      case 'Pending':
        return styles.pending;
      case 'Deployed':
        return styles.deployed; 
      case 'Deferred':
        return styles.deferred;    

      // Add more cases for other statuses if needed
      default:
        return styles.inProgress;
    };
  }
  return (
    <ScrollView style={styles.all}>
      <StatusBar backgroundColor={'#e9dbfc'} barStyle="dark-content" />
      {/* topbar  */}
      <View style={styles.topBarContainer}>
        <View style={styles.topbarLeft}>
          <Text style={styles.logo}>Task Manager</Text>
        </View>

        <View style={styles.topbarRight}>
          {/* <Button title="Add New Task" color="#841584" onPress={() => setDialogOpen(true)} /> */}
          <TouchableOpacity style={[{width:'100%',backgroundColor:'#C21292',padding:11,borderRadius:6}]} onPress={() => setDialogOpen(true)}>
                 <Text style={styles.selectDateButtonText}>Add New Task</Text>
          </TouchableOpacity>
        </View>

        <Dialog.Container visible={isDialogOpen}>
          <Dialog.Title>CREATE A TASK</Dialog.Title>
          <Dialog.Description>
            Enter the details of the task:
          </Dialog.Description>
          <Dialog.Input
            autoFocus
            placeholder="Title"
            value={newTask.title}
            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            style={[styles.input,{width:'100%',maxWidth:'95%'}]}
          />
          <Dialog.Input
            placeholder="Description"
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            style={[styles.input,{width:'100%',minHeight:'12%',maxWidth:'95%'}]}
          />
          <Dialog.Input
            placeholder="Team"
            value={newTask.team}
            onChangeText={(text) => setNewTask({ ...newTask, team: text })}
            style={[styles.input,{width:'100%',marginTop:20,maxWidth:'95%'}]}
          />
          <Dialog.Input
            placeholder="Assignees"
            value={newTask.assignees}
            onChangeText={(text) => setNewTask({ ...newTask, assignees: text })}
            style={[styles.input,{width:'100%',maxWidth:'95%'}]}
          />
          <Text style={{fontWeight:'700',fontSize:14}}>Status</Text>
             <Picker
              selectedValue={newTask.status}
              onValueChange={(value) => setNewTask({ ...newTask, status: value })}
              style={[styles.picker,{width:'65%'}]}
            >
              <Picker.Item label="In Progress" value="In Progress" />
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Deployed" value="Deployed" />
              <Picker.Item label="Deferred" value="Deferred" />
            </Picker>
        <Text style={{fontWeight:'700',fontSize:14}}>Priority</Text>
          <Picker
            selectedValue={newTask.priority}
            onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
            style={[styles.picker]}
          >
            <Picker.Item label="P0" value="P0" />
            <Picker.Item label="P1" value="P1"/>
            <Picker.Item label="P2" value="P2"/>
            </Picker>
          <Dialog.Button label="Cancel"  style={{ color: 'red' }} onPress={() => setDialogOpen(false)} />
          <Dialog.Button label="Add Task" style={{ color: '#0ba6ff' }} onPress={handleAdd} />
        </Dialog.Container>
      </View>
      <View style={styles.topbarCenter}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="rgb(31, 31, 30)" style={{marginLeft:8}}/>
            <TextInput
              placeholder="Search for tasks, words & more here!"
              style={[styles.searchInput,{marginLeft:2}]}
              value={filters.search}
              onChangeText={(text) => setFilters({ ...filters, search: text })}
            />
          </View>
        </View>

      <View style={styles.app}>
        <View style={styles.filters}>
          <Text style={styles.heading}>Filter By:</Text>

           <View style={styles.datePickerContainer}>
           <View style={styles.content}>
          <Text style={styles.label}>From Date: </Text><Text style={styles.selectedDate}>{fromDate.toDateString()}</Text>
          </View>
          <View style={styles.content}>
          <TouchableOpacity style={{marginLeft:10,backgroundColor:'white',borderRadius:20,padding:3}} onPress={() => setShowFromDatePicker(true)}>
             <Icon name="calendar" size={26} color="#841584" style={{textAlign:'center',padding:4}}/> 
          </TouchableOpacity>
          {showFromDatePicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display="default"
              onChange={handleFromDateChange}
            />
          )}
          
          {fromDate && (
            <>
              <TouchableOpacity style={[styles.selectDateButton,{width:'40%',marginLeft:'56%',backgroundColor:'#D71313'}]} onPress={clearFromDate}>
                 <Text style={styles.selectDateButtonText}>Clear</Text>
              </TouchableOpacity>
            </>
          )}
          </View>
        </View>
        <View style={styles.datePickerContainer}>
          <View style={styles.content}>
          <Text style={styles.label}>To Date: </Text><Text style={styles.selectedDate}>{toDate.toDateString()}</Text>
          </View>
          
          <View style={styles.content}>
          <TouchableOpacity style={{marginLeft:10,backgroundColor:'white',borderRadius:20,padding:3}} onPress={() => setShowToDatePicker(true)}>
            <Icon name="calendar" size={26} color="#841584" style={{textAlign:'center',padding:4}}/>
          </TouchableOpacity>
          {showToDatePicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display="default"
              onChange={handleToDateChange}
            />
          )}
          {toDate && (
            <>
                <TouchableOpacity style={[styles.selectDateButton,{width:'40%',marginLeft:'56%',backgroundColor:'#D71313'}]} onPress={clearToDate}>
                 <Text style={styles.selectDateButtonText}>Clear</Text>
                </TouchableOpacity>
            </>
          )}
          </View>
        </View>
          <TextInput
            placeholder="Assignees"
            value={filters.assignees}
            onChangeText={(text) => setFilters({ ...filters, assignees: text })}
            style={styles.input}
          />
          <Picker
            selectedValue={filters.priority}
            onValueChange={(value) => setFilters({ ...filters, priority: value })}
            style={[styles.picker]}
          >
            <Picker.Item label="Priority" value="" />
            <Picker.Item label="P0" value="P0" />
            <Picker.Item label="P1" value="P1" />
            <Picker.Item label="P2" value="P2" />
          </Picker>
        </View>

        <View style={styles.sort}>
          <Text style={styles.heading}>Sort By:</Text>
          <Picker
            selectedValue={pp}
            onValueChange={(value) => setPp(value)}
            style={[styles.picker]}
          >
            <Picker.Item label="Priority" value="" />
            <Picker.Item label="P0 to P2" value="low" />
            <Picker.Item label="P2 to P0" value="high" />
          </Picker>
        </View>

        <ScrollView style={styles.taskContainer}>
          {/* Display tasks grouped by their status */}
          {Object.keys(tasksByStatus).map((status, index) => (
            <View key={index} style={styles.taskColumn}>
              <Text style={[styles.status, getStatusStyle(status)]}>{status}</Text>
              <ScrollView  horizontal={true}>
              {tasksByStatus[status].map((task) => (
                <View key={task.id} style={styles.task}>
                  <Text style={[styles.subHeading, getStatusStyle(status),{borderRadius:6,padding:6,color:'white'}]}>Status: {task.status}</Text>
                  <Text style={[styles.subHeading,{fontSize:22}]}>{task.title}</Text>
                  <Text>{task.description}</Text>
                  <View style={styles.content}>
                  <Text style={[styles.subHeading]}>Start Date: </Text><Text>{task.startDate.toDateString()}</Text>
                  </View>
                  {task.endDate && <View style={styles.content}><Text style={[styles.subHeading]}>End Date: </Text><Text>{task.endDate.toDateString()}</Text></View>}
                  <View style={styles.content}>
                  <Text style={[styles.subHeading]}>Team: </Text><Text>{task.team}</Text>
                  </View>
                  <View style={styles.content}>
                  <Text style={[styles.subHeading]}>Assignees: </Text><Text>{task.assignees}</Text>
                  </View>
                    <View style={styles.content}>
                      <Text style={styles.subHeading}>Priority: </Text>
                      <Text>{task.priority}</Text>
                     </View>
                  {task.status !== 'Completed' && (
                     <View style={[styles.content,{marginTop:10}]}>
                     <Text style={[styles.subHeading]}>Edit</Text>
                     <Icon name="edit" size={20} color="rgb(31, 31, 30)" style={{marginLeft:5,alignItems:'center',justifyContent:'center'}}/>
                     <Text style={[styles.subHeading]}>:</Text>
                     </View>
                  )}
                  {task.status !== 'Completed' && (
                    <View style={[styles.content,{margin:0,}]}>
                    <Text style={{fontWeight:'700',fontSize:14}}>Status :</Text>
                    <Picker
                      selectedValue={task.status}
                      onValueChange={(value) => handleStatusSelectChange(task.id, value)}
                      style={{ height: 50, width: '78%',color:'#605f5f',padding:0}}
                    >
                      {Object.keys(tasksByStatus).map((optionStatus) => (
                        <Picker.Item key={optionStatus} label={optionStatus} value={optionStatus} />
                      ))}
                    </Picker>
                    </View>
                  )}

                  {task.status !== 'Completed' && (
                     <View style={[styles.content,{margin:0}]}>
                     <Text style={{fontWeight:'700',fontSize:14}}>Priority :</Text>
                    <Picker
                      selectedValue={task.priority}
                      onValueChange={(value) => handlePriorityChange(task.id, value)}
                      style={[{ height: 50, width: '49%',color:'#605f5f',padding:0}]}
                    >
                      <Picker.Item label="P0" value="P0" />
                      <Picker.Item label="P1" value="P1" />
                      <Picker.Item label="P2" value="P2" />
                    </Picker>
                    </View>
                  )}

                  <Button title="Delete" color="#94000f" onPress={() => deleteTask(task.id)} />
                </View>
              ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  all:{
     backgroundColor: '#e9dbfc',
  },
  topBarContainer: {
    backgroundColor:'#e9dbfc',
    display:'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  topbarLeft:{
    flex: 3,
  },

  logo: {
    fontSize: 28,
    fontWeight:'bold',
    color:'black'
  },
  searchBar: {
    backgroundColor:'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    margin: 8,
    width: '95%',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  topbarRight: {
    flex: 1.8,
    display: 'flex',
  },
  app: {
    padding: 10,
  },
  heading:{
    fontSize: 19,
    fontWeight:'600',
    color:'black'
  },
  filters: {
    marginBottom: 10,
  },
  sort: {
    marginBottom: 10,
  },
  taskContainer: {

  },
  taskColumn: {
    padding:10,
    marginBottom: 10,
  },
  status: {
    fontSize: 20,
    fontWeight:'600',
    color:'white',
    minHeight: 25,
    minWidth:240,
    borderRadius: 10,
    padding: 10,
    backgroundColor:'yellow',
    marginBottom:25,
    textAlign: 'center',
  },
  inProgress:{
    backgroundColor: 'orange',
  },
  deferred:{
    backgroundColor: 'rgb(244, 147, 163)',
  },
  deployed :{
    backgroundColor: 'rgb(0, 6, 124)',
  },
  pending :{
    backgroundColor: 'rgb(109, 109, 107)',
  },
  completed: {
    backgroundColor: 'green',
  },
  task: {
    borderWidth: 1,
    borderColor: '#aeadad',
    borderRadius: 5,
    padding: 10,
    paddingBottom:20,
    margin:10,
    marginBottom: 10,
    backgroundColor:'wheat',
    width:230
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subHeading:{
    fontSize: 15,
    fontWeight:'500',
    color:'black'
  },
  input:{
    backgroundColor:'#eae4e4',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    margin: 5,
    width: '90%',
    height:35,
  },
  picker:{
    color:'#605f5f',
    borderWidth: 1,
    borderColor: '#6f6f6f',
    borderRadius: 10,
    marginTop:0,
    marginLeft:0,
    margin: 5,
    height: 40, width: '40%' 
  },
  datePickerContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedDate:{
    marginBottom: 5,
  },
  selectDateButton: {
    backgroundColor:'#841584',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 4,
    maxWidth:70,
  },
  selectDateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignItems:'center',
    justifyContent:'center',
    textAlign:'center'
  },
});

export default App;
  
