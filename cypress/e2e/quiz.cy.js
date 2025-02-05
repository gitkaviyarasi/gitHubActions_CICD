// @ts-nocheck
describe("Quiz App - End-to-End Test", () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/');
  });
 
  it('should start the quiz when the button is clicked', () => {
    cy.get('button').contains('Start Quiz').click();
  });


  it('should display the first question after starting the quiz', () => {
    cy.get('button').contains('Start Quiz').click();
  });

  it('should display the next question when an answer is clicked', () => {
    cy.get('button').contains('Start Quiz').click();
    cy.get('button').contains('1').click();
    cy.get('h2').should('not.contain', 'What is 2 + 2?'); 
  }); 

  it('should not display repeated questions when navigating through the quiz', () => {
    const seenQuestions = [];
  
    function validateQuestionUniqueness(questionIndex) {
      if (questionIndex >= 5) return; // Check first 5 questions (adjust as needed)
  
      cy.get('h2') // Use a proper selector for your question element
        .invoke('text')
        .then((currentQuestion) => {
          // Verify question hasn't been shown before
          expect(seenQuestions, `Duplicate question found: "${currentQuestion}"`).not.to.include(currentQuestion);
          
          // Store current question
          seenQuestions.push(currentQuestion);
          
          // Answer and move to next question
          cy.get('button.btn-primary').first().click(); 
          
          // Check next question
          validateQuestionUniqueness(questionIndex + 1);
        });
    }
  
    // Start quiz
    cy.contains('button', 'Start Quiz').click();
    
    // Begin question validation
    validateQuestionUniqueness(0);
  });

  it('should increment the score when the correct answer is clicked', () => {
    // Load the fixture data
    cy.fixture('questions.json').then((fixture) => {
      cy.intercept('GET', '/api/questions/random', {
        statusCode: 200,
        body: fixture, // Use the fixture data
      }).as('getQuestions');
      
      cy.visit('http://localhost:3001/');
      cy.get('button').contains('Start Quiz').click();
      cy.wait('@getQuestions').then((intercept) => {
        const questions = intercept.response.body;
        cy.wrap(questions).as('questions');
      });
      cy.get('button').contains('1').click(); // Click the correct answer
      cy.get('button').contains('2').click(); // Click the correct answer
      cy.get('.alert-success').should('contain', '2/2'); // Check score
    });
  });

  it('should not increment the score when the wrong answer is clicked', () => {
    // Load the fixture data
    cy.fixture('questions.json').then((fixture) => {
      cy.intercept('GET', '/api/questions/random', {
        statusCode: 200,
        body: fixture, // Use the fixture data
      }).as('getQuestions');
      
      cy.visit('http://localhost:3001/');
      cy.get('button').contains('Start Quiz').click();
      cy.wait('@getQuestions').then((intercept) => {
        const questions = intercept.response.body;
        cy.wrap(questions).as('questions');
      });
      cy.get('button').contains('2').click(); // Click the incorrect answer
      cy.get('button').contains('1').click(); // Click the incorrect answer
      cy.get('.alert-success').should('contain', '0/2'); // Check score
    });
  });

  it('should not show the next question untill the displayed question is answered', () => {
    // Intercept the API request to mock the response with fixture data
    cy.fixture('questions.json').then((fixture) => {
      cy.intercept('GET', '/api/questions/random', {
        statusCode: 200,
        body: fixture,
      }).as('getQuestions');
  
      cy.visit('http://localhost:3001/');
  
      // Ensure the start button is visible before clicking it
      cy.get('button').contains('Start Quiz').should('be.visible').click();
      
      cy.wait('@getQuestions');

      // Ensure the <h2> (or loading text) exists before the questions are loaded
      cy.get('h2').should('exist');   
  
      // Ensure the quiz UI elements are now visible
      cy.get('button').contains('1').should('be.visible'); // Check that the quiz buttons are now visible
  
      // Proceed with the quiz interaction
      cy.get('button').contains('1').click(); // Click the correct answer
     
    });
  });
it('should display the final score when the quiz is completed', () => {
    // Load the fixture data
    cy.fixture('questions.json').then((fixture) => {
      cy.intercept('GET', '/api/questions/random', {
        statusCode: 200,
        body: fixture, // Use the fixture data
      }).as('getQuestions');
      
      cy.visit('http://localhost:3001/');
      cy.get('button').contains('Start Quiz').click();
      cy.wait('@getQuestions').then((intercept) => {
        const questions = intercept.response.body;
        cy.wrap(questions).as('questions');
      });
      // Answer all questions correctly
      cy.get('button').contains('1').click(); // Click the correct answer for Q1
      cy.get('button').contains('2').click(); // Click the correct answer for Q2
      cy.get('.alert-success').should('contain', '2/2'); // Check final score
    });
  })

  it('should start a new quiz when the restart button is clicked', () => {
    // Load the fixture data
    cy.fixture('questions.json').then((fixture) => {
      cy.intercept('GET', '/api/questions/random', {
        statusCode: 200,
        body: fixture, // Use the fixture data
      }).as('getQuestions');
      
      cy.visit('http://localhost:3001/');
      cy.get('button').contains('Start Quiz').click();
      cy.wait('@getQuestions').then((intercept) => {
        const questions = intercept.response.body;
        cy.wrap(questions).as('questions');
      });
      // Answer all questions correctly
      cy.get('button').contains('1').click(); // Click the correct answer for Q1
      cy.get('button').contains('2').click(); // Click the correct answer for Q2
      cy.get('.alert-success').should('contain', '2/2'); // Check final score

      // Click the restart button
      cy.get('button').contains('Take New Quiz').click();

      // Verify that the quiz has restarted (e.g., check for the start button)
      cy.get('h2').should('exist'); // Check that the question element is not visible
    });
  })

});
