<?php
class Question {
	public $a;
	public $t;
	
	public function __construct($text, $answers) {
		$this->t = $text;
		$this->a = $answers;
		shuffle($this->a);
	}
}

class Answer {
	public $t;
	public $c;
	public $f;
	
	public function __construct($text, $correct, $feedback) {
		$this->t = $text;
		$this->c = $correct;
		$this->f = $feedback;
	}
}

$questions = array(new Question("My Ideal Friend should be",
			array(new Answer("My age or in my class", false, ""),
			new Answer("There for me when things go wrong", true, ""),
			new Answer("Someone to help with homework", false, ""),
			new Answer("Able to keep secrets", true, ""),
			new Answer("Able to respect my feelings", true, ""),
			new Answer("Able to make me laugh", true, ""),
			new Answer("Someone who will not laugh AT me!", true, ""),
			new Answer("A fan of my favourite sports team", false, ""),
			new Answer("Someone who will look out for me", true, "")
            )));
            
shuffle($questions);
header('Content-Type: application/json');
echo json_encode(array_slice($questions, 0, intval($_POST["n"])));
?>