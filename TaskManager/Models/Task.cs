namespace TaskManager.Models;

//TaskModel is basically a class that defines the model how the task should create and behaves, it has properties like Id, title, Duedate and Priority and Status as Core features
public class TaskModel
{
    public int Id {get; set;}
    public required string Title {get; set;}
    public DateTime DueDate {get; set;} = DateTime.Now.AddDays(1);
    public string Priority {get; set;} = "Medium"; //Default
    public string Status {get;set;} = "Pending"; //Default

}