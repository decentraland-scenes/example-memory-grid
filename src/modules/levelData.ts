export type LevelData = {
    linesX:number,
    linesZ:number,
    subLevels:number,
    markedCells:number,
    showChallengeTime:number,
    displaySolutionTime:number,
    roundTime:number
}


export let levelData:LevelData[] = [
    {            
        linesX: 4,
        linesZ: 3,
        subLevels: 3,
        markedCells:5,
        showChallengeTime:5,
        displaySolutionTime:5,
        roundTime: 10
       
    },
    {            
        linesX: 4,
        linesZ: 4,
        subLevels: 3,
        markedCells:6,
        showChallengeTime:5,
        displaySolutionTime:5,
        roundTime: 12
       
    },
    {            
        linesX: 5,
        linesZ: 4,
        subLevels: 3,
        markedCells:6,
        showChallengeTime:5,
        displaySolutionTime:5,
        roundTime: 12
       
    },
    {            
        linesX: 5,
        linesZ: 5,
        subLevels: 3,
        markedCells:10,   
        showChallengeTime:10,
        displaySolutionTime:8,
        roundTime: 18
    },
    {            
        linesX: 6,
        linesZ: 5,
        subLevels: 3,
        markedCells:12,   
        showChallengeTime:10,
        displaySolutionTime:8,
        roundTime: 24
    },
    {            
        linesX: 6,
        linesZ: 6, 
        subLevels: 3,
        markedCells:15,
        showChallengeTime:30,
        displaySolutionTime:8,
        roundTime: 30     
    },
    
]