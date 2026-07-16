# Family directory

Shared language for the McPeak family directory app — members, surveys, and how they relate.

## Language

**Member**:
A person in the family directory whose profile can be viewed and edited.
_Avoid_: User, person, record (when you mean the person)

**Survey**:
A time-bounded questionnaire offered to signed-in Members (for example reunion interest).
_Avoid_: Form, poll, questionnaire (as the product noun)

**Survey Lifecycle**:
The rules for presenting an active Survey to a signed-in Member: route-driven open and close, auto-open of the next incomplete Survey, and don't-ask-again dismiss.
_Avoid_: Survey shell, survey orchestration, survey UX state machine

**Survey Submission**:
A Member's recorded answers for one Survey, accepted only while that Survey is active, not already completed on that browser, and not duplicating an existing respondent name for that Survey.
_Avoid_: Survey response (when you mean the accepted submission policy), survey POST
