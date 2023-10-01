describe('Ninja Chatbot', function() {
  
  beforeEach(function() {
    cy.visit('index.html') // replace with your actual path
  })

  it('should show chatbot on toggler button click', function() {
    cy.get('.chatbot').should('have.css', 'opacity', '0') // initially, the chatbot should be hidden
    cy.get('.chatbot-toggler').click()
    cy.get('.chatbot').should('have.css', 'opacity', '1') // chatbot should be visible now
  })

  it('Opens and Closes the Chatbot', () => {
      // Test to check if the chatbot toggler works properly
      cy.get('.chatbot-toggler').first().click(); // Ensure we click the first toggle button
      cy.get('.chatbot').should('have.css', 'opacity', '1'); // Chatbot should be visible

      // Click the close button inside the chatbot
      cy.get('.close-btn').click({ force: true });


      cy.get('.chatbot').should('have.css', 'opacity', '0'); // Chatbot should not be visible
  });

  it('Send a message using Chatbot', () => {
      cy.get('.chatbot-toggler').first().click();
      cy.get('textarea').type('Hello, Ninja Bot!{enter}');
      cy.get('.chatbox .outgoing p').should('contain', 'Hello, Ninja Bot!');
  });

  it('Receives a reply from the Chatbot', () => {
      cy.get('.chatbot-toggler').first().click();
      cy.get('textarea').type('Hello, Ninja Bot!{enter}');

      // Wait for the reply from the chatbot
      cy.wait(2000); // Waiting for 2 seconds as a buffer (might need to adjust depending on the reply time)
      
      // Check if the chatbot replied with the 'Thinking...' placeholder or an actual response
      cy.get('.chatbox .incoming p').should('not.be.empty');
  });

})



describe('Chatbot API Validation', () => {
  // This runs before each test in the block
  beforeEach(() => {
    cy.visit('index.html'); 
    
    cy.intercept({
      method: 'POST', 
      url: 'https://api.openai.com/v1/chat/completions',
    }).as('apiCheck');  
  });

  it('should get correct info from OpenAI API', () => {
    cy.get('.chatbot-toggler').click();

    // Type a message and send it
    cy.get('.chat-input textarea')
      .type('What is the capital of France?')
      .type('{enter}');

    // Wait for the API response
    cy.wait('@apiCheck').its('response.body').should((body) => {
      expect(body.choices).to.have.length(1);
      expect(body.choices[0].message.content).to.not.be.empty;
    });
    cy.get('.chat.incoming:last p').should('have.text', 'The capital of France is Paris.');
  });
});

describe('Chatbot Error Handling', () => {
  beforeEach(() => {
    cy.visit('index.html');
  });

  it('should handle API failure gracefully', () => {
      // Mock an API failure
      cy.intercept(
        {
          method: 'POST',
          url: 'https://api.openai.com/v1/chat/completions',
        },
        {
          statusCode: 500,
          body: { error: 'Internal server error' },
        }
      ).as('apiFail');
  
      cy.get('.chatbot-toggler').click();
      cy.get('.chat-input textarea')
        .type('What is the capital of France?')
        .type('{enter}');
  
      // Check for the actual error message displayed to the user
      cy.get('.chat.incoming:last p').should('have.text', 'Oops! Something went wrong. Please try again.');
    });
  it('should not send an empty message', () => {
      cy.get('.chatbot-toggler').click();
      cy.get('.chat-input textarea').type('{enter}'); // Press enter without typing anything
    
      // Ensure no new outgoing message is added
      cy.get('.chat.outgoing').should('have.length', 0);
      
  });
  
    
      
});


