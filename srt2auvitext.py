'''
Create JS array from SRT file (UTF-8) for project "auvitext audioplayer"
Jens Grätzer, 2018-07-30

INPUT (from file "filename"):
1
00:00:05,468 --> 00:00:09,484
Some text, first line
Second line

2
00:00:09,484 --> 00:00:13,244
Next text, one line

----------

OUTPUT (in file "filename".js):
var mediafile = "xxxx.m4a";
var subt = [
 [5.468,9.484,"Some text, first line<br>Second line"],
 [9.484,13.244,"Next text, one line"]
];

'''

import re

# SRT file name
filename = "example.srt"

# read the file into linesList
with open(filename, encoding="utf-8-sig") as f:
    linesList = f.readlines()

## TEST output all lines read
#for line in linesList:
#    print (line.strip())

# Pattern for 'nn:nn:nn --> nn:nn:nn'
timestampPattern = re.compile('(\d+)\:(\d+)\:([\d,\.]+) --> (\d+)\:(\d+)\:([\d,\.]+)')

# Read all lines, create output data array "outDataList"
textOutput = ""
outDataList = list()

# Prepare output of first lines
print ('var mediafile = "xxxx.m4a";')   # TEST: Output on screen
outDataList.append('var mediafile = "xxxx.m4a";\n')

# Two additional lines for other application
print ('//var lan_1 = "deutsch";')
outDataList.append('//var lan_1 = "deutsch"\n')

print ('//var subt_1 = [;')
outDataList.append('//var subt_1 = [\n')

# Prepare output of data array
print ('var subt = [')   
outDataList.append("var subt = [\n")

outLineCounter = 0
for line in linesList:
    line = line.strip()
    # If match at 'nn:nn:nn --> nn:nn:nn' ... decode the time values
    m = timestampPattern.search(line)
    if m:      
        hoursStartStr = m.group(1)
        minutsStartStr = m.group(2)
        secondsStartStr = m.group(3)
        secondsStartStr = secondsStartStr.replace(',', '.')

        hoursEndStr = m.group(4)
        minutsEndStr = m.group(5)
        secondsEndStr = m.group(6)
        secondsEndStr = secondsEndStr.replace(',', '.')

        hoursStartInt = int(hoursStartStr)
        minutsStartInt = int(minutsStartStr)
        secondsStartFloat = float(secondsStartStr)
        
        hoursEndInt = int(hoursEndStr)
        minutsEndInt = int(minutsEndStr)
        secondsEndFloat = float(secondsEndStr)
        
        startTimeOutput = (hoursStartInt * 60 + minutsStartInt) * 60 + secondsStartFloat
        endTimeOutput = (hoursEndInt * 60 + minutsEndInt) * 60 + secondsEndFloat
        
        startTimeOutputStr = "{0:.3f}".format(startTimeOutput)
        endTimeOutputStr = "{0:.3f}".format(endTimeOutput)
        
        ## TEST:
        #print('____from_')
        #print(startTimeOutputStr)
        #print('_to_')
        #print(endTimeOutputStr)

        # Clean the variable for next record
        textOutput = "";

    elif(line != ""):
        # print(line)   # TEST
        if (textOutput == "") :
            textOutput = line
        else :
            textOutput = textOutput + "<br>" + line
    else :
        # print("Red a blank line: End of currend record.");   # TEST
        outLineCounter += 1
        
        # Transform the " character to \"
        textOutput = textOutput.replace('"', '\\"')
        
        # Prepare output of the whole array
        if textOutput != "" :
            if outLineCounter > 1 :
                print (",")
                outDataList.append(",\n")
            record = " [" + startTimeOutputStr + "," + endTimeOutputStr + ',"' + textOutput + '"]'
            print(record, end="")
            outDataList.append(record)
        
        textOutput = "" # Clean the variable for next record

# Process the last line, if it is still missing 
if(textOutput != "") :
    # Transform the " character to \"
    textOutput = textOutput.replace('"', '\\"')

    # Prepare output of this line into JS-Array
    if outLineCounter > 1 :
        print (",")
        outDataList.append(",\n")
    record = " [" + startTimeOutputStr + "," + endTimeOutputStr + ',"' + textOutput + '"]'
    print(record, end="")
    outDataList.append(record)
        
print ("")
print ("];")
outDataList.append("\n];\n")   # Output preparation finished

# Write the data into file
outFilename = filename + ".js"
with open(outFilename, 'w', encoding="utf-8") as f:
    for item in outDataList:   
        f.write(item)
 