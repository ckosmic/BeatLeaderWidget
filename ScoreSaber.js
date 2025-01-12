// SCORESABER VERSION

// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: window-restore;

// ScoreSaber.js 1.0.0 by Speecil

let userId = args.widgetParameter;

const apiBaseUrl = "https://scoresaber.com/api";
const playerEndpoint = `${apiBaseUrl}/player`;

if(!userId){
  userId = "3033139560125578";
}

const playerApiUrl = `${playerEndpoint}/${userId}/full`;
const playerTopPlayApiUrl = `${playerEndpoint}/${userId}/scores?limit=1&sort=top&page=1`;

const playerReq = new Request(playerApiUrl);
const playerRes = await playerReq.loadJSON();

const playerTopPlayReq = new Request(playerTopPlayApiUrl);
const playerTopPlayRes = await playerTopPlayReq.loadJSON();

const rankHistory = playerRes.histories.split(',');

const avatarUrl = playerRes.profilePicture;
const avatarReq = await new Request(avatarUrl);
const avatarImg = await avatarReq.loadImage();

const toEmojiFlag = (countryCode) => countryCode.toLowerCase().replace(/[a-z]/g, (i) => String.fromCodePoint((i.codePointAt(0) ?? 0) - 97 + 0x1f1e6));
const flagEmoji = toEmojiFlag(playerRes.country);

const upArrow = "\u23F6";
const downArrow = "\u23F7";
const noChange = "\u2013";

const diffDaysAgo = 1;

const graphRect = new Rect(120, 338, 540, 300);

const context = new DrawContext();
context.opaque = false;

let widgetSize = "big";
let fontSize = 12;
switch (config.widgetFamily) {
  case "small":
    context.size = new Size(380, 380);
    widgetSize = "small";
    fontSize = 11;
    break;
  case "medium":
    context.size = new Size(720, 360);
    widgetSize = "big";
    fontSize = 12;
    break;
  case "large":
  default:
    context.size = new Size(720, 720);
    widgetSize = "big";
    fontSize = 12;
    break;
}

const createWidget = () => {
  const w = new ListWidget();
  w.backgroundColor = new Color("#000000", 1);
  
  const headerStack = w.addStack();
  headerStack.centerAlignContent();
  headerStack.url = `https://scoresaber.com/u/${userId}`;
  
  const avatarImage = headerStack.addImage(avatarImg);
  avatarImage.imageSize = new Size(30, 30);
  avatarImage.cornerRadius = 15;
  
  headerStack.addSpacer(6);
  
  if (widgetSize !== "small") {
    const titleElement = headerStack.addText(playerRes.name);
    titleElement.textColor = Color.white();
    titleElement.textOpacity = 1.0;
    titleElement.font = Font.boldRoundedSystemFont(18);
    titleElement.lineLimit = 1;
  
    const blElement = headerStack.addText(" - ScoreSaber");
    blElement.textColor = Color.white();
    blElement.textOpacity = 0.7;
    blElement.font = Font.mediumRoundedSystemFont(14);
    blElement.lineLimit = 1;
  }
  
  w.addSpacer(10);
  
  const statsStack = w.addStack();
  
  const leftStack = statsStack.addStack();
  leftStack.layoutVertically();
  
  if (widgetSize === "big") {
    const rankHeaderElement = leftStack.addText("Global rank");
    rankHeaderElement.textColor = Color.white();
    rankHeaderElement.font = Font.boldRoundedSystemFont(fontSize);

    const rankStack = leftStack.addStack();
    const rankElement = rankStack.addText(`#${formatNumber(playerRes.rank)}`);
    rankElement.textColor = Color.white();
    rankElement.font = Font.lightRoundedSystemFont(fontSize);
    rankElement.lineLimit = 1;
    rankStack.addSpacer(8);
    const rankDiff = rankHistory.slice(-diffDaysAgo)[0] - playerRes.rank;
    const rankArrow = rankDiff < 0 ? downArrow : rankDiff > 0 ? upArrow : noChange;
    if (rankArrow !== noChange) {
      const rankDiffElement = rankStack.addText(`${rankArrow} ${formatNumber(Math.abs(rankDiff))}`);
      rankDiffElement.textColor = rankDiff < 0 ? Color.red() : rankDiff > 0 ? Color.green() : Color.lightGray();
      rankDiffElement.font = Font.lightRoundedSystemFont(fontSize);
    }
  } else {
    const headerRankStack = headerStack.addStack();
    headerRankStack.layoutVertically();
    
    const rankStack = headerRankStack.addStack();
    const rankElement = rankStack.addText(`${String.fromCodePoint(0x1F30E)} #${formatNumber(playerRes.rank)}`);
    rankElement.textColor = Color.white();
    rankElement.font = Font.lightRoundedSystemFont(fontSize);
    rankElement.lineLimit = 1;
    rankStack.addSpacer(4);
    const rankDiff = rankHistory.slice(-diffDaysAgo)[0] - playerRes.rank;
    const rankArrow = rankDiff < 0 ? downArrow : rankDiff > 0 ? upArrow : noChange;
    if (rankArrow !== noChange) {
      const rankDiffElement = rankStack.addText(`${rankArrow} ${formatNumber(Math.abs(rankDiff))}`);
      rankDiffElement.textColor = rankDiff < 0 ? Color.red() : rankDiff > 0 ? Color.green() : Color.lightGray();
      rankDiffElement.font = Font.lightRoundedSystemFont(fontSize);
    }

    const cankStack = headerRankStack.addStack();
    const cankElement = cankStack.addText(`${flagEmoji} #${formatNumber(playerRes.countryRank)}`);
    cankElement.textColor = Color.white();
    cankElement.font = Font.lightRoundedSystemFont(fontSize);
    cankElement.lineLimit = 1;
    cankStack.addSpacer(4);
  }
  
  const ppHeaderElement = leftStack.addText("Performance points");
  ppHeaderElement.textColor = Color.white();
  ppHeaderElement.font = Font.boldRoundedSystemFont(fontSize);
  
  const ppStack = leftStack.addStack();
  const ppElement = ppStack.addText(`${formatNumber(playerRes.pp)}pp`);
  ppElement.textColor = Color.white();
  ppElement.font = Font.lightRoundedSystemFont(fontSize);
  ppElement.lineLimit = 1;
  ppStack.addSpacer(8);
  
  const accHeaderElement = leftStack.addText("Average accuracy");
  accHeaderElement.textColor = Color.white();
  accHeaderElement.font = Font.boldRoundedSystemFont(fontSize);
  
  const accStack = leftStack.addStack();
  const accElement = accStack.addText(playerRes.scoreStats?.averageRankedAccuracy ? (Math.round(playerRes.scoreStats.averageRankedAccuracy) + "%") : "N/A");
  accElement.textColor = Color.white();
  accElement.font = Font.lightRoundedSystemFont(fontSize);
  accStack.addSpacer(8);
  
  if(widgetSize !== "small") {
    statsStack.addSpacer(null);
  }
  
  const rightStack = widgetSize === "small" ? leftStack : statsStack.addStack();
  rightStack.layoutVertically();
  
  if (widgetSize === "big") {
    const cankHeaderElement = rightStack.addText(`Country rank - ${flagEmoji}`);
    cankHeaderElement.textColor = Color.white();
    cankHeaderElement.font = Font.boldRoundedSystemFont(fontSize);

    const cankStack = rightStack.addStack();
    const cankElement = cankStack.addText(`#${formatNumber(playerRes.countryRank)}`);
    cankElement.textColor = Color.white();
    cankElement.font = Font.lightRoundedSystemFont(fontSize);
    cankStack.addSpacer(8);
    
  }
  
  const topPpHeaderElement = rightStack.addText("Top PP");
  topPpHeaderElement.textColor = Color.white();
  topPpHeaderElement.font = Font.boldRoundedSystemFont(fontSize);
  
  const topPpStack = rightStack.addStack();
  const topPpElement = topPpStack.addText(playerTopPlayRes.playerScores[0]?.score.pp ? (formatNumber(playerTopPlayRes.playerScores[0]?.score.pp) + "pp") : "N/A");
  topPpElement.textColor = Color.white();
  topPpElement.font = Font.lightRoundedSystemFont(fontSize);
  topPpStack.addSpacer(8);
  
  if (widgetSize === "big") {
    const plyHeaderElement = rightStack.addText("Play count");
    plyHeaderElement.textColor = Color.white();
    plyHeaderElement.font = Font.boldRoundedSystemFont(fontSize);
    
    const plyStack = rightStack.addStack();
    const plyElement = plyStack.addText(playerRes.scoreStats?.totalPlayCount ? (formatNumber(playerRes.scoreStats.totalPlayCount)) : "N/A");
    plyElement.textColor = Color.white();
    plyElement.font = Font.lightRoundedSystemFont(fontSize);
    plyStack.addSpacer(8);
    
  }
  
  statsStack.addSpacer(null);
  
  // Rank chart
  if (config.widgetFamily === "large" || config.widgetFamily == null) {
  
    w.addSpacer(null);
    
    rankHistory.shift();
    rankHistory.push(playerRes.rank);
    
    const drawGraphLine = (data, color) => {
      for(let i = 0; i < data.length; i++) {
        if (i < data.length - 1) {
          p1 = new Point(
            lerp(graphRect.minX, graphRect.maxX, i / (data.length-1)), 
            lerp(graphRect.minY, graphRect.maxY, percent(parseInt(data[i]), min, max))
          );
          p2 = new Point(
            lerp(graphRect.minX, graphRect.maxX, (i+1) / (data.length-1)), 
            lerp(graphRect.minY, graphRect.maxY, percent(parseInt(data[i+1]), min, max))
          );
  
          drawLine(p1, p2, 3, color);
        }
      }
    };
    
    
    let min = Infinity;
    let max = 0;
  
    for(let i = 0; i < rankHistory.length; i++) {
      const tmp = parseInt(rankHistory[i]);
      min = (tmp < min ? tmp : min);
      max = (tmp > max ? tmp : max);
    }
  
    let base = 100000;
    const cmp = max - min;
    if(cmp >= 0 && cmp <= 10) base = 4;
    else if(cmp > 10 && cmp <= 100) base = 10;
    else if(cmp > 100 && cmp <= 1000) base = 100;
    else if(cmp > 1000 && cmp <= 10000) base = 1000;
    else if(cmp > 10000 && cmp <= 100000) base = 10000;
  
    min = Math.floor(min / base) * base;
    max = Math.ceil(max / base) * base;
    if(min === 1) min = 0;
    if(max === 1) max = 2;
  
    // Draw axis lines
    drawLine(
      new Point(graphRect.minX, graphRect.minY), 
      new Point(graphRect.minX, graphRect.maxY), 
      1, 
      Color.gray()
    );
    drawLine(
      new Point(graphRect.minX, graphRect.maxY), 
      new Point(graphRect.maxX, graphRect.maxY), 
      1, 
      Color.gray()
    );
  
    const ySegments = 4;
    const steps = base * Math.ceil((max - min) / base) / ySegments;
  
    // Y axis lines (rank range)
    let index = 0;
    let y = 0;
    while(y  < max) {
      y = min + index * steps;
    
      if(y % 1 === 0) {
        const lineY = lerp(graphRect.minY, graphRect.maxY, percent(y, min, max));
  
        drawLine(
          new Point(graphRect.minX, lineY), 
          new Point(graphRect.maxX, lineY), 
          1, 
          Color.gray()
        );
    
        context.setTextAlignedRight();
        const rankRect = new Rect(0, lineY-11, 100, 23);
        drawTextR(y + "", rankRect, Color.gray(), Font.boldRoundedSystemFont(19));  
      }
  
      index++;
    }
  
    // X axis lines (days ago)
    for(let i = 0; i < 5; i++) {
      const x = lerp(0, rankHistory.length, i/4);
    
      const lineX = lerp(graphRect.minX, graphRect.maxX, i/4);
    
      drawLine(
        new Point(lineX, graphRect.minY), 
        new Point(lineX, graphRect.maxY), 
        1, 
        Color.gray()
      );
    
      context.setTextAlignedCenter();
      const rankRect = new Rect(lineX-50, graphRect.y+320, 100, 23);  
      let text = (rankHistory.length - Math.floor(x)) + 1;
      if(text === 1) text = "now";
	    drawTextR(text, rankRect, Color.gray(), Font.boldRoundedSystemFont(19));
    }
  
    const rankRect = new Rect(graphRect.x, graphRect.y - 40, graphRect.width, 30);
    drawTextR(`Rank over the past ${rankHistory.length + 1} days`, rankRect, Color.white(), Font.boldRoundedSystemFont(24));
  
    drawGraphLine(rankHistory, Color.blue());
  }
  
  return w;
};

const kFormatter = (num) => {
  return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num);
};

const drawTextR = (text, rect, color, font) => {
	context.setFont(font);
	context.setTextColor(color);
	context.drawTextInRect(String(text).toString(), rect);
};

const drawLine = (a, b, width, color) => {
  const path = new Path();
  path.move(a);
  path.addLine(b);
  context.addPath(path);
  context.setStrokeColor(color);
  context.setLineWidth(width);
  context.strokePath();
}

const lerp = (a, b, t) => {
  return a * (1 - t) + b * t;
}

const percent = (x, a, b) => {
  return (x - a) / (b - a);
}

const formatNumber = (num) => {
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const widget = createWidget();
widget.backgroundImage = context.getImage();

const refreshMinutes = 30;
const now = new Date();
const later = new Date(now.getTime() + refreshMinutes * 60000);
widget.refreshAfterDate = later;

await widget.presentLarge();

Script.setWidget(widget);
Script.complete();