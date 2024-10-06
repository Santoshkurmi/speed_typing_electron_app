import React, { useState, useEffect, useRef } from 'react';
import { PauseIcon, Play, RefreshCw, Timer } from 'lucide-react';
import nepaliCorpus from "./assets/nepali.txt";
import englishCorpus from "./assets/english.txt";
import wallpaer from "./assets/bg.jpg";
import music from "./assets/music.m4a";
import { tmpdir } from 'os';

const keyToNep: any = {
  //
  "a": "\u093E", // ा
  "b": "\u092C", // ब
  "c": "\u091A", // च

  "d": "\u0926", // द
  "e": "\u0947", // े
  "f": "\u0909", // उ
  "g": "\u0917", // ग
  "h": "\u0939", // ह
  "i": "\u093F", // ि
  "j": "\u091C", // ज
  "k": "\u0915", // क
  "l": "\u0932", // ल
  "m": "\u092E", // म
  "n": "\u0928", // न
  "o": "\u094B", // ो
  "p": "\u092A", // प
  "q": "\u091F", // ट
  "r": "\u0930", // र
  "s": "\u0938", // स
  "t": "\u0924", // त
  "u": "\u0941", // ु
  "v": "\u0935", // व
  "w": "\u094C", // ौ
  "x": "\u0921", // ड
  "y": "\u092F", // य
  "z": "\u0937", // ष
  //
  "A": "\u0906", // आ
  "B": "\u092D", // भ
  "C": "\u091B", // छ
  "D": "\u0927", // ध
  "E": "\u0948", // ै
  "F": "\u090A", // ऊ
  "G": "\u0918", // घ
  "H": "\u0905", // अ
  "I": "\u0940", // ी
  "J": "\u091D", // झ
  "K": "\u0916", // ख
  "L": "\u0933", // ळ
  "M": "\u0902", // ं
  "N": "\u0923", // ण
  "O": "\u0913", // ओ
  "P": "\u092B", // फ
  "Q": "\u0920", // ठ
  "R": "\u0943", // ृ
  "S": "\u0936", // श
  "T": "\u0925", // थ
  "U": "\u0942", // ू
  "V": "\u0901", // ँ
  "W": "\u0914", // औ
  "X": "\u0922", // ढ
  "Y": "\u091E", // ञ
  "Z": "\u090B", // ऋ
  //
  "0": "\u0966", // ०
  "1": "\u0967", // १
  "2": "\u0968", // २
  "3": "\u0969", // ३
  "4": "\u096A", // ४
  "5": "\u096B", // ५
  "6": "\u096C", // ६
  "7": "\u096D", // ७
  "8": "\u096E", // ८
  "9": "\u096F", // ९
  //
  "^": "\u005E", // ^
  //
  "`": "\u093D", // ऽ
  "~": "\u093C", // ़
  //
  "_": "\u0952", // ॒
  //
  "+": "\u200C", // ZWNJ
  "=": "\u200D", // ZWJ
  //
  "[": "\u0907", // इ
  "{": "\u0908", // ई
  //
  "]": "\u090F", // ए
  "}": "\u0910", // ऐ
  //
  "\\": "\u0950", // ॐ
  "|": "\u0903", // ः
  //
  "<": "\u0919", // ङ
  //
  ".": "\u0964", // ।
  ">": "\u0965", // ॥
  //
  "/": "\u094D", // ्
  "?": "\u003F", // ?
};

const keyToEng: any = {};


enum Level{
  VERY_LOW,LOW,MEDIUM,HIGH,VERY_HIGH,ULTRA_HIGH
}


Object.keys(keyToNep).forEach(key => {
  const value = keyToNep[key];
  keyToEng[value] = key;  // Swap key and value
});


// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)

export default function TypingBox() {
  const [words, setWords] = useState<string[]>([]);
  const sentenceWordTrack = useRef<number>(-1);
  const sentence = useRef<string[]>([]);

  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<"nepali" | "english">(  localStorage.getItem("language") =="english" ?  "english" : "nepali");
  const [duration, setDuration] = useState(  parseInt(localStorage.getItem("timer") ?? "1" )*60  );
  const [nextLetterHint, setNextLetterHint] = useState("");
  const [currentWPM, setCurrentWPM] = useState(0)
  const [currentCPM, setCurrentCPM] = useState(0)
  const [timer, setTimer] = useState(duration);
  const characterCount = useRef(0)
  const [isActive, setIsActive] = useState(false);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [wordDuration,setWordDuration] = useState<number[]>([])

  const [sentenceToCompare,setSentenceToCompare] =  useState("");
  const [sentenceToCompareTime,setSentenceToCompareTime] =  useState(0);
  const startTime = useRef<null|number>(null)
  const [level,setLevel] = useState<Level>(parseInt(localStorage.getItem("level") ?? "2" ))
  const [isSentenceTesting, setSententenceTesting] =useState(false);
  const [showEachWordTime,setShowEachWordTime] = useState(  localStorage.getItem("showTime")=="true"? true:false  )

  const [accuracy,setAccuracy] = useState(0)
  const [limiter,setLimiter] = useState(0)

  

  // const noOfErrors = useRef<number>(0);
  const currentIndexOfWord = useRef<number>(0);
  const currentCorrectIndexWordLength = useRef<number>(0);
  const errorCounts = useRef<number>(0);
  const totalCount = useRef(0);
  const currentErrorIndex = useRef<number>(-1);
  const errorsIndex = useRef<number[]>([]);
  const [wordLength,setWordLength] = useState(10)
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [result, setResult] = useState({ accuracy: 0, wrong: 0, right: 0 })

  const playerRef = useRef<HTMLAudioElement>(null)
  const [playing,setPlaying] = useState(false)

  // const words = useMemo(() => text.split(" "), [text]);
  // const []
  const [fileContent, setFileContent] = useState<string[]>([]);



  useEffect(() => {
    textAreaRef.current?.focus()
    const fetchFile = async () => {
      // alert(language)
      const response = await fetch(language == "nepali" ? nepaliCorpus : englishCorpus);
      const text = await response.text();
      setFileContent(text.split("\n").sort(() => 0.5 - Math.random()));
    };
    fetchFile();
  }, [language]);


  useEffect(() => {
    if (fileContent.length == 0) return;
    handleReset()
    // console.log("hello2")
    setRandomWords()
  }, [fileContent,level])




  function setRandomWords() {

    var sentenceNow = sentence.current;
    var senTrack = sentenceWordTrack.current;
    // console.log(sentence.current, "Now")
    if (sentenceNow.length == 0) {
      const index = Math.round(Math.random() * (fileContent.length - 1));
      if(language=="nepali")
        sentence.current = fileContent[index].split(" ")
      
      else if(level==Level.VERY_LOW)
        sentence.current = fileContent[index]. replace(/[.,'"]/g, "").replace(/  /g,"").toLowerCase().split(" ")
      else if (level == Level.LOW)
        sentence.current = fileContent[index].toLowerCase().split(" ")
      else if (level == Level.MEDIUM)
        sentence.current = fileContent[index].split(" ")
      sentenceNow = sentence.current;

      sentenceWordTrack.current = 0;
      senTrack = 0;
    }
    // const senTrack = sentenceWordTrack.current;
    // if(senTrack < sentenceN  ow.length ){
    let quotient = Math.ceil((sentenceNow.length - senTrack) / wordLength);
    let remainder = (sentenceNow.length - senTrack) % wordLength;
    if (quotient > 0) {
      sentenceWordTrack.current = senTrack + wordLength;
      setWords(sentenceNow.slice(senTrack, senTrack + wordLength))
    }
    else if (remainder > 0) {
      sentenceWordTrack.current = senTrack + remainder;
      setWords(sentenceNow.slice(senTrack, senTrack + remainder))
    }
    else {
      sentence.current = [];
      setRandomWords()
    }

  }






  useEffect(() => {
    var interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      if (interval)
        clearInterval(interval);
      setIsActive(false);
      calculateWPM();

    }
    return () => { interval && clearInterval(interval); }
  }, [isActive, timer]);

  const calculateCurrentWPM = () => {
    const correctTotal = totalCount.current - errorCounts.current;
    const wordsPerMin = Math.round(correctTotal / (duration - timer) * 60);
    const charsPerMin = Math.round(characterCount.current / (duration - timer) * 60);
    setCurrentCPM(charsPerMin)
    setCurrentWPM(wordsPerMin);

  }

  const calculateWPM = () => {
    // const words = totalCount.current;
    const correctTotal = totalCount.current - errorCounts.current;
    // const charsPerMin = Math.round(characterCount.current / (duration - timer) * 60);
    const wordsPerMin = Math.round(correctTotal / (duration - timer) * 60);
    const accuracy = Math.ceil(correctTotal / totalCount.current * 100);
    // alert("Your speed is " + wordsPerMin)
    setResult({ accuracy: accuracy, right: correctTotal, wrong: errorCounts.current })
    setIsOpen(true)
    setWordsPerMinute(wordsPerMin);
  };

  const handleStart = () => {
    setIsActive(true);
    // setInput('');
    currentIndexOfWord.current = 0;
    currentErrorIndex.current = -1;
    errorsIndex.current = [];
    totalCount.current = 0;
    sentence.current = [];
    errorCounts.current = 0
    setTimer(duration);
    setNextLetterHint("")
    setCurrentCPM(0)
    setCurrentWPM(0)
    setWordDuration([])
    startTime.current = null;
    characterCount.current = 0
    setWordsPerMinute(0);
  };


  const handleReset = () => {
    setIsActive(false);
    setInput('');
    sentence.current = [];
    setTimer(duration);
    errorCounts.current = 0
    textAreaRef.current?.focus()
    setNextLetterHint("")

    currentIndexOfWord.current = 0;
    errorsIndex.current = [];
    currentErrorIndex.current = -1;
    totalCount.current = 0;
    setCurrentWPM(0)
    setCurrentCPM(0)
    setWordsPerMinute(0);
    setWordDuration([])
    startTime.current = null;
    characterCount.current = 0
    setRandomWords()

  };

  const sentenceTesting = (input:string)=>{
      setInput(input)
      if(input.length==0){
        startTime.current = null;
        return;
      }
      if(startTime.current==null){
        startTime.current = performance.now()
        return
      }
      if(sentenceToCompare+" " == input){
        setSentenceToCompareTime( Math.ceil( performance.now() - startTime.current ) )
        startTime.current = null
        setInput("")
        return 
      }
  }

  const wordDurationCalculate = (input:string)=>{
    // setInput(input)
    if(input.length==0){
      startTime.current = null;
      return;
    }
    if(startTime.current==null){
      startTime.current = performance.now()
      return
    }
    // if(sentenceToCompare+" " == input){
    
    //   setInput("")
    //   return 
    // }
}
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    var currentText = e.target.value
    const length = currentText.length;
    if(currentText=="\n" || currentText==" " || currentText.length>0 && currentText[length - 1] == "\n" ) return
    if(isSentenceTesting) return sentenceTesting(currentText);
    wordDurationCalculate(currentText)
    // console.log(currentText)
    const currentWord = words[currentIndexOfWord.current]



    if (language == "nepali" && currentText.trim().length > 0 && currentText[length - 1] != " ") {
      var mapped = keyToNep[currentText[length - 1]]
      if (mapped != undefined)
        currentText = currentText.substring(0, length - 1) + mapped
    }

    if (language == "nepali")
      if (length < currentWord.length) {
        setNextLetterHint(keyToEng[currentWord[length]]);
      } else {
        setNextLetterHint("")
      }
  
    if (isActive && currentText.trim().length > 0 && currentText[length - 1] == " ") {
      // setNextLetterHint("")
      currentCorrectIndexWordLength.current = 0
      totalCount.current++;
      // console.log(totalCount)
      if (currentWord.substring(0, length) + " " != currentText) {
        if(limiter>0) return
        errorsIndex.current.push(currentIndexOfWord.current);
        setSentenceToCompareTime(0)
        setWordDuration(prev=>[...prev,0])
        // startTime.current = null
        errorCounts.current++;
        // alert()
      } else {

        if(startTime.current){
          var dura =  Math.ceil( performance.now() - startTime.current );
          startTime.current = null;
         if(limiter>0){
          var totalTime = length * limiter
          var diff = dura - totalTime
          if(diff>0) {
            setSentenceToCompareTime(-diff)
            currentCorrectIndexWordLength.current = 0
            setInput("")

            return
          }
          else{
            dura = -diff;
          }
         }
       
          setWordDuration(prev=>[...prev,dura])
          setSentenceToCompareTime(dura )
        }
     

        startTime.current = null
        characterCount.current = characterCount.current + currentWord.length;
        // setCharaterCount(prev=>prev+)
      }
      // else currentErrorIndex.current = -1;
      currentIndexOfWord.current++;


      if (currentIndexOfWord.current > words.length - 1) {
        setRandomWords()
        setWordDuration([])
        currentIndexOfWord.current = 0;
        errorsIndex.current = [];
        currentErrorIndex.current = -1;
      } else if (language == "nepali") {
        const currentWordTe = words[currentIndexOfWord.current]
        setNextLetterHint(keyToEng[currentWordTe[0]]);

      }

      setInput("")
      calculateCurrentWPM()

    }
    else {
      if (currentWord.substring(0, length) != currentText) {
        currentErrorIndex.current = currentIndexOfWord.current;
        setNextLetterHint("")
        currentCorrectIndexWordLength.current = 0;

      }
      else{
        currentErrorIndex.current = -1;
        currentCorrectIndexWordLength.current = currentText.length;
      }

      setInput(currentText)
    }
    if (!isActive && currentText.length == 1) {
      handleStart()

    }//
  }

  const toggleMusic = ()=>{
    if(!playing)
      playerRef.current?.play()
    else playerRef.current?.pause()
  }

  // console.log(localStorage.getItem("language"))
  // console.log(duration)

  return (
    <div
      style={{ backgroundImage: `url(${wallpaer})` }}
      className={"flex select-none  font-serif bg-cover bg-center  flex-col items-center justify-center min-h-screen  text-white   p-4 "}>

      <audio ref={playerRef} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}  className='bg-gray-900 text-gray-400 '>
        <source  src={music} type='audio/mp3'/>
      </audio>



      <div className="w-full   max-w-5xl relative bg-gray-700/70 rounded-lg shadow-md p-6 py-12">
      
      <button onClick={()=>setSententenceTesting(prev=>!prev)} className='absolute left-0 top-0 p-4'></button>
      <button onClick={()=>{setShowEachWordTime(prev=>{ localStorage.setItem("showTime",prev? "false":"true" );return !prev})   }} className='absolute right-0 top-0 p-4'></button>


      <div className="langauge absolute flex gap-5 left-10 top-10 p-3">
            <select  onChange={(e) => { setWordLength(  parseInt(e.target.value) ) ; handleReset()}} className='bg-gray-600 rounded-md p-3'>
              <option value="10">10 Words</option>
              <option value="11">11 Words</option>
              <option value="12">12 Words</option>
              <option value="13">13 Words</option>
              <option value="14">14 Words</option>
              <option value="15">15 Words</option>
              <option value="16">16 Words</option>
              <option value="17">17 Words</option>
              <option value="18">18 Words</option>
              <option value="19">19 Words</option>
              <option value="20">20 Words</option>

            </select>

          <div onClick={toggleMusic} className=' hover:opacity-85 active:opacity-65 top-4 -right-16'>
            {playing?  <PauseIcon size={30} className='text-green-300 '/> :<Play size={30} className='text-red-500'/>}
          </div>

          {
            language=="english" && 
            <select value={level}  onChange={(e) => { setLevel(  parseInt(e.target.value) );localStorage.setItem("level",e.target.value) }} className='bg-gray-600 rounded-md p-3'>
            <option value={Level.VERY_LOW}>Very Low</option>
            <option value={Level.LOW}>Low</option>
            <option value={Level.MEDIUM}>Medium</option>
          </select>
          }
         

            <input type='text' value={limiter} onChange={(e)=> setLimiter(parseInt(e.target.value==""? "0": e.target.value) ?? 0)} className='w-12 text-xl rounded-lg bg-gray-600' />

          </div>


        <div className='absolute right-10 top-10 flex gap-10'>
        
    
        
          <select value={ (timer/60).toString()} onChange={(e) => { handleReset(); setDuration(parseInt(e.target.value) * 60); setTimer(parseInt(e.target.value) * 60);localStorage.setItem("timer",e.target.value) }} className='bg-gray-600 rounded-md p-3'>
            <option value="1">1 Min</option>
            <option value="2">2 Min</option>
            <option value="5">5 Min</option>
            <option value="10">10 Min</option>
            <option value="30">30 Min</option>

          </select>

          <div className="langauge  top-0 right-0">
            <select value={language} onChange={(e) => { setLanguage(e.target.value as any);localStorage.setItem("language",e.target.value) }} className='bg-gray-600 rounded-md p-3'>
              <option value="nepali">Nepali</option>
              <option value="english">English</option>

            </select>
          </div>
          <RefreshCw onClick={handleReset} className=" hover:opacity-80 active:opacity-30 text-red-400 right-32 top-2 w-7 h-7 mr-2" />





        </div>

        {
          modalIsOpen && <div className='absolute z-50  left-[50%] h-[70%] -translate-y-[50%] shadow-lg -translate-x-[50%] top-[50%] p-7 rounded-md w-[80%] bg-gray-800'>
            <div className='text-center text-5xl mb-4 bg-green-700 rounded-md text-white font-bold'>{wordsPerMinute} WPM</div>
            <div className='text-center text-5xl mb-10 bg-blue-700 rounded-md text-white font-bold'>{currentCPM} CPM</div>
            <div className='flex justify-between text-2xl px-20'>
              <div className="div">Accuracy</div>
              <div>{result.accuracy}{"%"}</div>
            </div>
            <div className='w-full h-[1px] bg-white'></div>

           
            <div className='w-full h-[1px] bg-white'></div>
            <div className='flex justify-between text-2xl px-20'>

              <div className="div">Correct Words</div>
              <div>{result.right}</div>
            </div>

            <div className='w-full h-[1px] bg-white'></div>

            <div className='flex justify-between text-2xl px-20'>

              <div className="div text-red-600">Wrong Words</div>
              <div>{result.wrong}</div>
            </div>
            <div className='w-full h-[1px] bg-white'></div>

            <div className='flex justify-between text-2xl px-20'>

              <div className="div text-red-600">Total Chars typed</div>
              <div>{characterCount.current}</div>
            </div>
            <div className='w-full h-[1px] bg-white'></div>

            <div className='text-center flex justify-center mt-6'>
              <button
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-red-600 focus:outline-none"
                onClick={() => { setIsOpen(false); handleReset() }}
              >
                Close
              </button>
            </div>



          </div>
        }

        <div className="text-center  flex-row flex justify-center">
          <div className="div">
            <div className="text-4xl text-green-400 font-bold mb-2">{timer}</div>
            <div className="text-xl">
              {isActive ? "" : "Ready"}
            </div>
            <div className="text-3xl text-purple-400">
              {currentWPM} {" wpm"}
            </div>
            <div className="text-3xl text-blue-400">
              {currentCPM} {" cpm"}
            </div>
            <div className='text-3xl text-blue-300 font-bold'>
              {nextLetterHint == "" ? "😊" : nextLetterHint}

            </div>

          </div>


        </div>

        <div className="bg-gray-800/60 flex flex-wrap p-4 rounded">
          {
           isSentenceTesting ?
            <input
           onChange={(e)=>setSentenceToCompare(e.target.value)}
           value={sentenceToCompare}
           placeholder='Enter sentence to test'
          className="w-full text-3xl p-4  bg-gray-800/20  rounded focus:outline-none focus:border focus:border-gray-300 resize-none "

           /> :words.map((word, index) => {


              

              return <span key={index} className={'text-3xl relative mx-1 p-1 py-2 rounded-md font-medium ' +

                (index == currentIndexOfWord.current && (currentErrorIndex.current == currentIndexOfWord.current ? "bg-red-500 " : "border border-gray-400 ")) +
                (index < currentIndexOfWord.current && (errorsIndex.current.indexOf(index) != -1 ? " text-red-500 " : " text-green-500 "))
              }>

              {
                 showEachWordTime && index < currentIndexOfWord.current  &&
                <span className='absolute w-full text-center bottom-[65%] text-xl text-yellow-400'>{wordDuration[index]}</span>

              }
                {language=="english" && currentIndexOfWord.current == index && currentCorrectIndexWordLength.current>0 ? <>
                
                <span className='text-green-500'>{word.substring(0,currentCorrectIndexWordLength.current)}</span>
                <span>{word.substring(currentCorrectIndexWordLength.current)}</span>

                </> : word  }
              </span>

            })
          }

         
        </div>

        {
             <div className='text-2xl flex gap-3 justify-center items-center text-yellow-400'>
            <Timer/>
              {sentenceToCompareTime} ms</div>
          }


        <textarea
          rows={1}
          ref={textAreaRef}
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          className="w-full text-3xl p-4  bg-gray-800/20  rounded focus:outline-none focus:border focus:border-gray-300 resize-none "
          value={input}
          onChange={(e) => handleInput(e)}
          placeholder={isActive ? "" : "Start typing here..."}
          disabled={modalIsOpen}
        />

        <div className="flex justify-center space-x-4">


        </div>
      </div>
    </div>
  );
}