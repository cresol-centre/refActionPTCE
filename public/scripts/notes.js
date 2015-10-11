Parse.initialize("O8dECYavaIBZwi34qBZnIkvwAQEWVXjAiHwOGbKb", "2Vmb5IdO9TgrBA4FVh2eovsNmPy2JpqW72H8Rlzi");


$(document).ready(function () {
    var Indicateur = Parse.Object.extend("Indicateur");
    var NoteSaisie = Parse.Object.extend("NoteSaisie");

    var links = "<ul>";

    for (var i = 1; i <= 6; i++) {
        links += "<li class='badge text-right'>"+i+"</li>";
    }
    links += "</ul>";


    var $indicatorsForm = $('#indicators');
    var $formContainer = $indicatorsForm.find('.indicators-container');
    var footer = $('footer'),
        previousButton = footer.find('#previous'),
        nextButton = footer.find('#next'),
        finishButton = footer.find("#finish"),
        width = $indicatorsForm.width();
    footer.find('button').hide();


    var currentPage = 0;
    function actualizeButtons() {
        if (currentPage <= 0) {
            previousButton.hide();
        } else {
            previousButton.show();
        }
        if(currentPage < ($formContainer.find('section').length - 1)) {
            nextButton.show();
        } else {
            nextButton.hide();
            finishButton.show();
        }
    }
    function next() {
        console.log(currentPage +1, $formContainer.find('section').length);
        if(currentPage + 1 >= $formContainer.find('section').length) return;
        currentPage++;
        actualizeButtons();
        console.log(currentPage +1, $formContainer.find('section').length);
        $formContainer.animate({
            "left": "-=" +width+"px"
        });
    }
    function previous() {
        if(currentPage <= 0) return;
        currentPage--;
        actualizeButtons();
        console.log(currentPage +1, $formContainer.find('section').length);
        $formContainer.animate({
            "left": "+=" +width+"px"
        });
    }

    nextButton.click(next);
    previousButton.click(previous);

    var notes = {};
    function noteSelect(id) {
        return function() {
            var element = $(this);
            console.log("toto");
            notes[id].note = element.text() | 0;
            element.parent().find('.badge').removeClass('selected');
            element.addClass('selected');
            next();
        }
    }

    var allIndicators = new Parse.Query(Indicateur);
    allIndicators.include("objectifPrincipal");
    allIndicators.include("objectifPrincipal.objectifGeneral");
    allIndicators.find({
        success: function (results) {
            $formContainer.width(width * (results.length+1));
            for (var i = 0; i < results.length; i++) {
                var indicateur = results[i];
                var objectifPrincipal = indicateur.get('objectifPrincipal');
                var objectifGeneral = objectifPrincipal.get('objectifGeneral');
                var html = "<section>"+
                    "<header>"+objectifGeneral.get('label')+"</header>"+
                    "<div class='content'>"+
                    "<h2>"+objectifPrincipal.get('label')+"</h2>"+
                    "<p>"+indicateur.get('label')+"</p>"+
                    links+
                    "</div>"+
                    "</section>";
                var domElement = $(html);
                notes[indicateur.id] = {
                    indicateur: new Indicateur({id: indicateur.id}),
                    note: 1
                };
                domElement.find('.badge').click(noteSelect(indicateur.id));
                $formContainer.append(domElement);
            }
            $formContainer.find('section').width(width);
            footer.show();
            actualizeButtons();
        },
        error: function (error) {
            console.log(error);
        }
    });

    $indicatorsForm.submit(function (e) {
        e.preventDefault();
        var notesList = Object.keys(notes).map(function (id) {
            return notes[id];
        });
        var noteSaisies = new NoteSaisie();
        noteSaisies.set('notes', notesList);
        noteSaisies.save(null, {
            success: function () {
                console.log("C'est sauvegardé avec succès !");
            }
        });
    });
});