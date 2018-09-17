
var textTitle = "";
var uploadButton = document.getElementById('uploadButton');
uploadButton.addEventListener('click', handleImage, false);
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var image = new Image();
image.crossOrigin = "anonymous";
let fileName = '';
var justDoIt = new Image();


async function printAtWordWrap( context , text, x, y, lineHeight, fitWidth)
{
    fitWidth = fitWidth || 0;
    
    if (fitWidth <= 0)
    {
        context.fillText( text, x, y );
        return;
    }
    var words = text.split(' ');
    var currentLine = 0;
    var idx = 1;
    while (words.length > 0 && idx <= words.length)
    {
        var str = words.slice(0,idx).join(' ');
        var w = context.measureText(str).width;
        if ( w > fitWidth )
        {
            if (idx==1)
            {
                idx=2;
            }
            context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
            currentLine++;
            words = words.splice(idx-1);
            idx = 1;
        }
        else
        {idx++;}
    }
    if  (idx > 0)
        context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
}


function DrawOverlay(image) {
    ctx.drawImage(image, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var px = imageData.data;
    var length = px.length;

    for (var i = 0; i < length; i += 4) {
        var redpx = px[i];
        var greenpx = px[i + 1];
        var bluepx = px[i + 2];
        var alphapx = px[i + 3];

        var greyscale = redpx * .3 + greenpx * .59 + bluepx * .11;
        px[i] = greyscale;
        px[i + 1] = greyscale;
        px[i + 2] = greyscale;
    }

    ctx.putImageData(imageData, 0, 0)

    var widthX = (justDoIt.width * .5) * (image.width + image.height) * 0.000525
    var heightY = (justDoIt.height * .5) * (image.width + image.height) * 0.000525
    var x = (canvas.width - widthX) / 2
    var y = canvas.height - (canvas.height * 0.1)


    ctx.drawImage(justDoIt, x, y, widthX, heightY);
    justDoIt.src = '/img/justdoit.png';

    ctx.fillStyle = 'rgba(30, 144, 255)';
}


function DrawText() {
    ctx.fillStyle = "white";
    ctx.textBaseline = 'middle';
    ctx.font = `${(image.width + image.height) * 0.02}px 'Crimson Text', serif`;
    ctx.textAlign = 'center';
}


function DynamicText(image) {

    var centerX = image.width / 2;
    var centerY = image.height / 2;

    document.getElementById('quote').addEventListener('keyup', function (event) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var lastLetter = event.key;
        console.log(lastLetter)

        var mouseX = ctx.measureText(textTitle);
        console.log(mouseX)

        DrawOverlay(image);

        DrawText();
        textTitle = this.value;
        ctx.textAlign = 'center';

        lengthWidth = image.width - (image.width * 0.5)

        printAtWordWrap(ctx, textTitle, centerX, centerY, 30, lengthWidth );
    });
}


async function handleImage(event) {
    ctx.clearRect(image, 0, 0, canvas.width, canvas.height);
    console.log(`Width: ${canvas.width} Height: ${canvas.height}`)

    uploadImage.click();

    uploadImage.addEventListener('change', (e) => {

        const file = document.querySelector('input[type=file]').files[0];

        console.log(`Width: ${canvas.width} Height: ${canvas.height}`)
        const reader = new FileReader();

        if (file) {
            fileName = file.name;
            reader.readAsDataURL(file);
        }

        reader.addEventListener('load', () => {
            image = new Image();
            image.src = reader.result;

            // console.log(image)
            image.onload = function () {

                canvas.width = image.width;
                canvas.height = image.height;

                convertImageToGreyScale(image);
                console.log(image)

                ctx.drawImage(image, 0, 0, image.width, image.height);

                DynamicText(image);

                canvas.removeAttribute('data-caman-id');
            }
        }, false)
    })
}


function convertImageToGreyScale(image) {
    Caman('#canvas', image, function () {
        this.greyscale().render();
    })
}


downloadButton.addEventListener('click', (e) => {

    const fileExtension = fileName.slice(-4);
    let newFileName;

    if (fileExtension == '.jpg' || fileExtension === '.png') {
        newFileName = fileName.substring(0, fileName.length - 4) + '-edited.jpg';
    }

    downloadImage(canvas, newFileName);
})


function downloadImage(canvas, fileName) {

    let event;

    const link = document.createElement('a');

    link.download = fileName;
    link.href = canvas.toDataURL('image/jpeg', 0.8);

    event = new MouseEvent('click');

    link.dispatchEvent(event);
}

