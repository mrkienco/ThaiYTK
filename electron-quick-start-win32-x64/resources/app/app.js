var app = angular.module('app', ['ngSanitize', 'ngRoute']);
var fs = require('fs');
var spawn = require('child_process').spawn;
const { exec } = require('child_process');
const {dialog} = require('electron').remote


app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "audio.html"
    })
    .when("/audio", {
        templateUrl : "audio.html"
    })
    .when("/video", {
        templateUrl : "video.html"
    })
    .when("/keys", {
        templateUrl : "keys.html"
    });
});
state = {}
state.project = ''

app.controller('KeysController', function($scope, $location) {
    $scope.keys = 'xin chafo casc ban';
    fs.readFile('keys.txt', function(err, data) {
        $scope.keys = data;
        $scope.$apply();
    });

    $scope.save = function() {
        console.log('' + $scope.keys);
        fs.writeFile("keys.txt", $scope.keys, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
    }
});
app.controller('AudioController', function($scope, $location) {
    $scope.voices = ['male', 'female', 'hatieumai', 'ngoclam', 'leminh', 'vbee'];

    $scope.result = '>';
    $scope.voice = "female";
    $scope.speed = 0;
    $scope.prosody = false;

    $scope.openFolderDialog = function() {
        dialogResult = dialog.showOpenDialog({properties: ['openFile', 'openDirectory']});
        if(dialogResult) {
            $scope.folder = dialogResult;
        }
    }

    $scope.save = function() {
        if(! $scope.folder) {
            return;
        }

        fs.writeFileSync($scope.folder + '/input.txt', $scope.input_text, 'utf8');

        console.log('run all');
        var runall    = spawn('audio_maker.exe', [$scope.folder, $scope.voice, $scope.speed, $scope.prosody]); //, { cwd: "app" }
        $scope.result = '> run all <br/>';
        runall.stdout.on('data', function (data) {
            console.log('stdout: ' + data.toString());
            $scope.result += '<span class="text-success"">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
            $scope.$apply();
        });
        runall.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
            $scope.result += '<span class="text-danger">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
            $scope.$apply();
        });
    }
});

app.controller('VideoController', function($scope, $location) {
    $scope.openFolderDialog = function() {
        dialogResult = dialog.showOpenDialog({properties: ['openFile', 'openDirectory']});
        if(dialogResult) {
            $scope.folder = dialogResult;
        }
    }
    $scope.time = 1;
    $scope.format = "jpg";
    $scope.opacity = 0.25;

    $scope.save = function() {
        if(! $scope.folder) {
            return;
        }
        console.log('render video');
        var runall    = spawn('video_maker.exe', [$scope.folder, $scope.time, $scope.format, $scope.fps, $scope.dimension, $scope.opacity]); //, { cwd: "app" }
        $scope.result = '> run all <br/>';
        runall.stdout.on('data', function (data) {
            console.log('stdout: ' + data.toString());
            $scope.result += '<span class="text-success"">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
            $scope.$apply();
        });
        runall.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
            $scope.result += '<span class="text-danger">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
            $scope.$apply();
        });

    }
});




app.controller('ProjectController', function($scope, $location) {
    $scope.projects = [];
    $scope.detail = function(project) {
        state.project = project;
        $location.url('/progress');
    }
    // fs.readdir('./../data', function(err, items) {
    //     for (var i=0; i<items.length; i++) {
    //         item = items[i];
    //         $scope.projects.push(item);
    //     }
    //     $scope.$apply();
    // });

    fs.readFile(`./../config.json`, 'utf8', function(err, data) {
        // Object.keys()
        $scope.projects = JSON.parse(data)
        // console.log($scope.project);
        $scope.$apply();
    });

})
app.controller('ProgressController', function($scope, $location) {
    $scope.project = {};
    $scope.project.name = state.project;
    $scope.progress = []
    $scope.percent = {};

    $scope.count = {};
    $scope.count.crawler = 0;
    $scope.count.image = 0;
    $scope.count.video = 0;
    $scope.count.youtube_upload = 0;
    $scope.count.audio = 0;
    $scope.count.audio_concat = 0;
    $scope.count.audio_background = 0;

    $scope.number_videos = 0

    fs.readFile(`./../config.json`, 'utf8', function(err, data) {
        $scope.project = JSON.parse(data)[state.project]
        console.log($scope.project)
        // $scope.$apply();
        
        $scope.progress = get_progress(state.project, $scope.project.start_chapter, $scope.project.lastest_chapter, $scope.project.chapter_per_video);
        // console.log($scope.progress);
        $scope.number_videos = Math.ceil($scope.project.lastest_chapter/$scope.project.chapter_per_video );
        $scope.percent.crawler = ($scope.count.crawler*100 / $scope.number_videos).toFixed(2);
        $scope.percent.audio = ($scope.count.audio*100 / $scope.number_videos).toFixed(2);
        $scope.$apply();
    });
    

    
    $scope.mother_image = '';
    $scope.start_mp3 = '';
    $scope.end_mp3 = '';

    get_progress = function(project, start_chapter, lastest_chapter, chapter_per_video) {
        listdir = fs.readdirSync('./../data/' + project);

        if(listdir.indexOf(($scope.project.image.name)) >= 0) {
            $scope.mother_image = '<span class="badge badge-success">Mother Image</span>'
        } else {
            $scope.mother_image = '<span class="badge badge-danger">Mother Image</span>'
        }

        if(listdir.indexOf('start.mp3') >= 0) {
            $scope.start_mp3 = '<span class="badge badge-success">start.mp3</span>'
        } else {
            $scope.start_mp3 = '<span class="badge badge-danger">start.mp3</span>'
        }

        if(listdir.indexOf('end.mp3') >= 0) {
            $scope.end_mp3 = '<span class="badge badge-success">end.mp3</span>'
        } else {
            $scope.end_mp3 = '<span class="badge badge-danger">end.mp3</span>'
        }


        arr = []

        for(let i = 1; i<= lastest_chapter; i+=10) {
            item = {}
            start = i;
            end = i + 9 <=lastest_chapter ? i+9 : lastest_chapter;
            item.chapter = `chapter ${start} - ${end}`

            item.crawler = '';
            
            for(let chapter = start; chapter <= end; chapter ++)
            {
                if(listdir.indexOf(('chuong-'+chapter+'.txt')) >= 0 && listdir.indexOf(('chuong-'+chapter+'.title') >= 0)) {
                    item.crawler += '<span class="text-success font-10" >' + chapter + '</span> ';
                    $scope.count.crawler += 1;
                } else {
                    item.crawler += '<span class="text-danger">' + chapter + '</span> ';
                }
            }

            // audio one chapter
            item.audio = '';
            
            for(let chapter = start; chapter <= end; chapter ++)
            {
                if(listdir.indexOf(('chuong-'+chapter)) >= 0 && fs.readdirSync('./../data/' + project + '/chuong-'+chapter).indexOf('full.mp3') >= 0) {
                    item.audio += '<span class="text-success font-10" >' + chapter + '</span> ';
                    $scope.count.audio += 1;
                } else {
                    item.audio += '<span class="text-danger">' + chapter + '</span> ';
                }
            }

            item.image = '';
            if(listdir.indexOf(('chuong-'+start+'-'+end)) >= 0 && fs.readdirSync('./../data/' + project + '/chuong-'+start+'-'+end).indexOf('chuong-'+start+'-'+end+'.png') >= 0) {
                item.image = '<span class="badge badge-success">Yes</span>';
                $scope.count.image += 1;
            } else {
                item.image = '<span class="badge badge-danger">No</span>';
            }

            item.audio_concat = '';
            if(listdir.indexOf(('chuong-'+start+'-'+end)) >= 0 && (fs.readdirSync('./../data/' + project + '/chuong-'+start+'-'+end).indexOf('full.mp3') >= 0) || (fs.readdirSync('./../data/' + project + '/chuong-'+start+'-'+end).indexOf('full.wav') >= 0)) {
                item.audio_concat = '<span class="badge badge-success">Yes</span>';
                $scope.count.audio_concat += 1;
            } else {
                item.audio_concat = '<span class="badge badge-danger">No</span>';
            }

            item.audio_background = '';
            if(listdir.indexOf(('chuong-'+start+'-'+end)) >= 0 && fs.readdirSync('./../data/' + project + '/chuong-'+start+'-'+end).indexOf('out.mp3') >= 0) {
                item.audio_background = '<span class="badge badge-success">Yes</span>';
                $scope.count.audio_background += 1;
            } else {
                item.audio_background = '<span class="badge badge-danger">No</span>';
            }

            item.video = '';
            if(listdir.indexOf(('chuong-'+start+'-'+end)) >= 0 && fs.readdirSync('./../data/' + project + '/chuong-'+start+'-'+end).indexOf('out.mp4') >= 0) {
                item.video = '<span class="badge badge-success">Yes</span>';
                $scope.count.video += 1;
            } else {
                item.video = '<span class="badge badge-danger">No</span>';
            }

            
            arr.push(item);
        }
        return arr;
        
    }
});



app.controller('HelloController', function($scope) {
    $scope.inputs = [];
    $scope.voices = ['male', 'female', 'hatieumai', 'ngoclam', 'leminh'];

    $scope.result = '>';
    $scope.voice = "female";
    $scope.speed = 0;
    $scope.input = "input";
    $scope.prosody = false;

    // fs.readdir('./app', function(err, items) {
    //     for (var i=0; i<items.length; i++) {
    //         item = items[i];
    //         tmp = item.split('.');
    //         if(tmp[tmp.length - 1] == 'txt' && tmp[0] != 'help'){
    //             $scope.inputs.push(tmp[0]);
    //         }
    //     }
    //     $scope.$apply();
    // });

    // $scope.merge = function() {
    //     console.log('merge');
    //     var merge    = spawn('app.exe', ['merge', $scope.input], { cwd: "app" });
    //     console.log($scope.voice);
    //     console.log($scope.speed);
    //     console.log($scope.input);
    //     console.log($scope.prosody);

    //     $scope.result = '> merge';
    //     $scope.$apply();
    //     merge.stdout.on('data', function (data) {
    //         console.log('stdout: ' + data.toString());
    //         $scope.result += '<span class="text-success">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
    //         $scope.$apply();
    //     });
    //     merge.stderr.on('data', function (data) {
    //         console.log('stderr: ' + data.toString());
    //         $scope.result += '<span class="text-danger">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
    //         $scope.$apply();
    //     });
    // }
    // $scope.run_all = function() {

    //     console.log('run all');
    //     exec('cd app');
    //     var runall    = spawn('app.exe', ['run_all', $scope.input, $scope.voice, $scope.speed, $scope.prosody], { cwd: "app" });
    //     $scope.result = '> run all <br/>';
    //     runall.stdout.on('data', function (data) {
    //         console.log('stdout: ' + data.toString());
    //         $scope.result += '<span class="text-success"">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
    //         $scope.$apply();
    //     });
    //     runall.stderr.on('data', function (data) {
    //         console.log('stderr: ' + data.toString());
    //         $scope.result += '<span class="text-danger">' + data.toString().split('\n').join('<br/>') + '</span><br/>';
    //         $scope.$apply();
    //     });
    // }
});