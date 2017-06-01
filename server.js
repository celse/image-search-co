var express = require('express'),
	app = express(),
	cors = require('cors'),
	url=require('url'),
	bodyparser = require('body-parser'),
	mongoose=require('mongoose'),
	Bing = require('node-bing-api')({ accKey: "0ab859ec6db843e78d78e5b6244e2aae" }),
	Tracer = require('./models/searchtrace');

/*
//mongodb://celsio:Desmo16@ds159517.mlab.com:59517/camp-project
//mondo connected mongodb://<dbuser>:<dbpassword>@ds159517.mlab.com:59517/camp-project
//mongoose.connect(process.env.MONGODB_URL ||'mongodb://localhost/imgsearch',(err, res)=>{
mongoose.connect('mongodb://celsio:Desmo16@ds159517.mlab.com:59517/camp-project',(err, res)=>{
	if(err) throw err;
	console.log('Connection succesfull')
});
*/
var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

var mongodbUri = 'mongodb://celsio:Desmo16@ds159517.mlab.com:59517/camp-project';

mongoose.connect(mongodbUri, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function () {console.log("Great success!")});


app.use(express.static(__dirname + '/public'));

//app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');


//Middleware used

app.use(bodyparser.json());
app.use(cors());


//get all search form dB
app.get('/api/latest/imagesearch',(req, res, next)=>{
	Tracer.find({},{"_id": 0,"updatedAt":0,"createdAt":0},(err, data)=>{
		if (err) throw err;
		res.render('pages/search',{lastsearch : data})
	});
	
});

app.get('/',(req, res, next)=>{
	res.render('pages/index')
})
app.get('/api/imagesearch/:id*',(req, res, next)=>{
	//var { id } = req.params;
	var	{ offset } = req.query;
	Bing.images(req.params.id,{top:req.query.offset}, (err, resp, body)=>{
		if (err) throw err;
		//console.log(body);
		var limiedtPage = parseInt(offset), dataArray=[];
		for (var i = 0; i < limiedtPage; i++) {
			dataArray.push({
				url : body.value[i].webSearchUrl,
				snippet : body.value[i].name,
				thumbnail : body.value[i].thumbnailUrl,
				context : body.value[i].hostPageDisplayUrl
			});
		}
		jsonArray = JSON.parse(JSON.stringify(dataArray));
		//res.send(jsonArray);
		//res.send(dataArray);
		res.render('pages/images',{images : dataArray})	
	});
	var serching = new Tracer({
		term : req.params.id,
		when: Date.now()
	});
	serching.save((err)=>{
		if (err) throw err;
		//res.json(serching)
	});
})


app.listen(process.env.PORT || 5000, ()=>{
	console.log('This Server is listen port 3000');
});