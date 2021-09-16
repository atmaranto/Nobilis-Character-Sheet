((window) => {
	let nobilisData = window.nobilisData = {};
	
	nobilisData.domainMiracles = {
		"data": [
			{
				"level": -1,
				"name": "generalRules",
				"label": "General Rules for Domain-Driven Miracles",
				"text": "Some general guidelines for Domain-Drive miracles:<br />" +
						"<ul>" +
							"<li>Lesser miracles can typically create or destroy any of the following:<br />" +
							"<ul>" +
								"<li>Up to 10 tons of material</li>" +
								"<li>One square mile of territory</li>" +
								"<li>One typical instance of the relevant Estate</li>" +
							"</ul></li>" +
							"<li>Lesser miracles are not mundane, but they create relatively mundane things, with limited miraculous properties. Anything on an \"epic\" scale typically requires a major" +
							" miracle.</li>" +
							"<li>A miracle of any level <b>can be combined with other miracles of its level or lower</b>, as long as it remains a single conceptual action.</li>" +
						"</ul>"
			},
			{
				"level": 0,
				"name": "estateDrivenDivinations",
				"label": "Estate-Driven Divinations",
				"text":	"Level-0 miracles, Estate-Driven Divinations, tell you about threat or damage to your Estate. When your Estate is in danger, it will call out to you, and you will feel its pain.<br />" +
						"You can also use these miracles to sense when someone prays to you, if that person knows your symbol or is intimately connected to your Estate. If you choose, you can hear their" +
						" prayer."
			},
			{
				"level": 1,
				"name": "ghostMiracles",
				"label": "Ghost Miracles",
				"text":	"Level-1 miracles summon \"ghosts\" of one's Estate: constructs of the character's mind with a <i>tiny</i> fraction of their Estate's power. Examples include ghostly fires with a" +
						" little bit of heat and ghostly sunlight that can illuinate a book. These miracles, also known as <b>cantrips</b>, are not true illusions. They are partially transparent to the" +
						" Sight, and even a mortal can sometimes tell that they are only seemings. Characters can use them to make their environment a little more comfortable.<br />" +
						"They are also the weapon of choice for formal Noble duels: two Nobles will try to best one another using only ghostly miracles that cause no real harm but that show a shimmaring image" +
						" of what they could accomplish.",
				"examples": [
					"(Music) Make an instrument sound better.",
					"(Forests) Make a \"ghost clearing\" for more comfortable sleep.",
					"(Storms) Make a day seem gloomier.",
					"(Night) Decorate a bedroom with little glowing \"stars\".",
					"(Emotion) Make someone calm sound angry.",
					"(Roads) Make a trail that doesn't go anywhere important.",
					"(Books) Fill a shelf with boring textbooks on nothing of note."
				]
			},
			{
				"level": 2,
				"name": "lesserDivinations",
				"label": "Lesser Divinations",
				"text": "Level-2 miracles give one mundane information about their Estate. A character with the Estate of the sun could predict the sunrise with exact precision, know the dates of all future" +
						" eclipses, and know exactly when the sun will hit a balcony. They could potentially use this information to estimate time accurately, even at night, assuming the sun's path is regular." +
						" One can also perform these miracles within a Chancel, although Powers do much of their investigation on location, by tradition.",
				"examples": [
					"(Music) Know how to play a requested song.",
					"(Forests) Know where a trail ends; know where to find herbs or water.",
					"(Storms) Know when a storm will hit a given city.",
					"(Night) Estimate the time until knihtfall; know somebody's dreams.",
					"(Emotion) Experience true empathy; divine someone's emotional state.",
					"(Roads) Know directions to anywhere.",
					"(Books) Read a closed book."
				]
			},
			{
				"level": 3,
				"name": "lesserPreservations",
				"label": "Lesser Preservations",
				"text": "Level-3 miracles include the simple wards: the moderately-powerful miracles of Preservation. If one had the estate of the Sun, a character could heat the Earth with sunlight or slow" +
						" the path of the sun in the sky. This does not generally cover miracles of epic scope or great drama; this level is for simple applications of the principle of Preservation.",
				"examples": [
					"(Music) Make a song that sticks in the listener's memory.",
					"(Forests) Ward a tree, making it resistant to weapons.",
					"(Storms) Make it rain for days (or, in Seattle, months).",
					"(Night) Keep night animals awake into day; prolong the night.",
					"(Emotion) Make someone stay happy for a long time.",
					"(Roads) Make a road seem longer or take longer to traverse it.",
					"(Books) Make a manuscript that returns to the editor if rejected."
				]
			},
			{
				"level": 4,
				"name": "lesserCreations",
				"label": "Lesser Creations",
				"text": "Level-4 miracles are simple Creation magics, miracles that cause part of one's Estate to come into being. This can be subtler than pulling a fire out of a hat or creating a sunbeam at" +
						" night. Making the sun rise early is a Creation miracle, because it causes day and the sunlight to appear. Note that a Power does not have to create a <i>whole</i> object: they can" +
						" create a fire without heat, a sunbeam without light, or even just one person's memory of a tree where no tree has ever been.",
				"examples": [
					"(Music) Make bewitchingly beautiful music.",
					"(Forests) Grow plants quickly from the naked Earth.",
					"(Storms) Spawn a lightning storm or a drizzle.",
					"(Night) Sink an area into darkness.",
					"(Emotion) Cause someone to feel angry or sad.",
					"(Roads) Create a new road, straight to one's destination.",
					"(Books) Create a how-to book for any domestic task."
				]
			},
			{
				"level": 5,
				"name": "lesserDestructions",
				"label": "Lesser Destructions",
				"text": "Level-5 miracles include lesser Destructions, which remove an aspect of one's Estate from the area or from existence. This is the magic of hurried sunsets and snuffed-out forest" +
						" fires. It can also create <b>\"negative images\"</b> of one's Estate, such as a sunbeam of darkness or a cold fire. In essence, there are three things one can do with a lesser destruction:" +
						" destroy an instance of one's Estate totally, destroy only a part or aspect of an element, and create a negative image with inverted or corrupted aspects of one's Estate.",
				"examples": [
					"(Music) Make silent but affecting music (negative image).",
					"(Forests) Shatter a tree or a few trees (total destruction); make a tree invisible (destroying a part).",
					"(Storms) Clear away rainclouds (total destruction); make a storm's raindrops dry (destroying a part).",
					"(Night) Make the sun rise early (total destruction); make the local night less dark (destroying a part).",
					"(Emotion) Cause someone to stop feeling angry or happy (total destruction).",
					"(Roads) Make someone lost (destroying a part - roads exist to prevent getting lost).",
					"(Books) Make a book incomprehensible, even with the same words (destroying a part)."
				]
			},
			{
				"level": 5,
				"name": "majorDivinations",
				"label": "Major Divinations",
				"text": "Level-5 miracles include major Divinations, miracles that reveal things to one through the agency of their Estate. This includes shadowy images of the future or other places, and exact" +
						" images of other places (past or present) where the Estate <b>has been</b>. For example, a character with the sun as their Estate might ask the sun about the activities of thier enemies." +
						" They would receive a report on anything that it saw in its journey through the sky.",
				"examples": [
					"(Music) Tell the future in extemporaneous song.",
					"(Forests) Find the mystical \"heart\" of a forest; talk to plants.",
					"(Storms) Scry in a bowl of rainwater.",
					"(Night) Know all that happens under the cloak of night.",
					"(Emotion) Know the root of every emotion felt during a scene.",
					"(Roads) Know about any interesting travels or travelers.",
					"(Books) Open a book at random and read a paragraph -- whatever it is will be relevant."
				]
			},
			{
				"level": 6,
				"name": "lesserChanges",
				"label": "Lesser Changes",
				"text":	"Level-6 miracles include lesser Change magic, miracles that twist and remake things from one's Estate into a new form with new properties. For example, the Power of the Sun might make the" +
						" sun shine red, or craft edible fire.",
				"examples": [
					"(Music) Make living music that reproduces by being heard.",
					"(Forests) Reshape trees into treelike playground equiptment.",
					"(Storms) Make raindrops sing; make it hail blueberries.",
					"(Night) Make starlight as bright as moonlight for a night.",
					"(Emotion) Make someone feel brand-new emotions.",
					"(Roads) Redirect a road, so it leads somewhere new.",
					"(Books) Change the genre of the books that a given author writes."
				]
			},
			{
				"level": 6,
				"name": "majorPreservations",
				"label": "Major Preservations",
				"text": "Level-6 miracles include major Preservation miracles of epic scope. Preserved sunlight, at this level, would no longer simple heat the Earth; it would be burned into the stone. The day, in" +
						" a single city or a given Chancel, could be made to last for what would normally be years.",
				"examples": [
					"(Music) Burn music into someone's mind so they could never forget a note.",
					"(Forests) Seal a forest against entrance by any enemy.",
					"(Storms) Make an ongoing storm perpetual, raging.",
					"(Night) Make it stay dark even when night ends and the sun is up.",
					"(Emotion) Make someone happy for ever and ever.",
					"(Roads) Make the road someone is on endless.",
					"(Books) Make an author eternally famous. Why do you think we still read Hemingway?"
				]
			},
			{
				"level": 7,
				"name": "majorCreations",
				"label": "Major Creations",
				"text":	"Level-7 miracles are major magics of Creation. Even the most epic of Creations is possible at these levels. With  a level 7 miracles, a character whose Estate is the sun could cause the sun" +
						" to rise in the middle of the night, or put a new, second, sun in the sky.",
				"examples": [
					"(Music) Deafen mortals for miles with loud music.",
					"(Forests) Grow a forest from a single seed.",
					"(Storms) Create a hurricane, tornado, or monsoon.",
					"(Night) Cast darkness over the Earth.",
					"(Emotion) Add new emotions to the normal human emotional vocabulary.",
					"(Roads) Make a one-mile road from Australia to America.",
					"(Books) Create librarie, masterpieces, and books of secret lore."
				]
			},
			{
				"level": 8,
				"name": "majorDestructions",
				"label": "Major Destructions",
				"text": "Level-8 miracles are the major Destrutive magics. With these miracles, a Power could \"turn off\" the sun or turn a baren desert into a glorious green land simply be \"removing\" its desiccation.",
				"examples": [
					"(Music) Destroy a song forever - no one will ever be able to recreate it.",
					"(Forests) Shatter a forest.",
					"(Storms) Calm the sky above the entire ocean.",
					"(Night) Make night as bright as day until you say otherwise.",
					"(Emotion) Remove a person's capacity to feel emotion.",
					"(Roads) Make it impossible to get to or from a location by <i>any</i> road.",
					"(Books) Destroy a written language."
				]
			},
			{
				"level": 9,
				"name": "majorChanges",
				"label": "Major Changes",
				"text": "Level-9 miracles, Major Changes, can do anything else to a character's Estate that is not covered by lesser miracles. These miracles are rarely-seen, as it's often better to combine creation and" +
						" destruction to achieve a similar effect. For example, if one wished to transform a pine foest into a forest of birch, they could simultaneously destroy the pines with a Greater Destruction and " +
						" create the birch forest with a Greater Creation. However, this would kill all the trees -- a single Level 9 miracle could preserve the original trees but change their species.",
				"examples": [
					"(Music) Give a song the ability to make any mortal listener weep.",
					"(Forests) Fill a forest with blue gnomes. Because, why not, I guess?",
					"(Storms) Make it rain every third day in a given Chancel.",
					"(Night) Fill the night with rainbows.",
					"(Emotion) Fill a crowd of Christmas shoppers with a murderous rage.",
					"(Roads) Make the roads of a small country twist like serpents.",
					"(Books) Rewrite all books into Esperanto."
				]
			}
		],
		
		"attributeMargins": {
			"simple": 0,
			"normal": 1,
			"hard": 2,
			"deep": 4,
			"wordOfCommand": 8
		}
	};
	
	nobilisData.aspectMiracles = {
		"data": [
			{
				"level": -1,
				"name": "generalRules",
				"label": "General Rules for Aspect-Driven Miracles",
				"text": "Some general guidelines for Aspect-Drive miracles:<br />" +
						"<ul>" +
							"<li>Aspect <b>cannot</b>, for instance:<br />" +
							"<ul>" +
								"<li>Silence a gun</li>" +
								"<li>Shroud an area in darkness</li>" +
								"<li>Make a painting one can walk through</li>" +
								"<li>Grow a tree from an acorn</li>" +
								"<li>Provide \"magical\" healing to others</li>" +
								"<li>Put a new sun in the sky</li>" +
								"<li>Provoke social influence among Powers</li>" +
								"<li>Change history</li>" +
							"</ul></li>" +
							"<li>In general, Aspect enables Powers to do things with their body and mind. These things can be superhuman, but they cannot inherently be outside of" + 
							" the scope of their body and mind.</li>" +
						"</ul>"
			},
			{
				"level": 0,
				"name": "peakPerformance",
				"label": "Peak Performance",
				"text":	"Humans often have bad days. Powers, however, can choose to forsake bad days. With an Aspect 0 miracle, a Power can make the most of thier natural, unmiraculous abilities. Using an" +
						 " level-0 Aspect miracle instead of an unmiraculous action ensures you perform to the best of your abilities."
			},
			{
				"level": 0,
				"name": "theSight",
				"label": "The Sight",
				"text":	"Powers possess a mythic \"Sight\" that enables them to identify others of their kind as Nobilis, magical objects as magical, Anchors as Anchors, Imperators as Imperators, Excrucians" +
						" as Excrucians, and so on. It will also give them a vague idea about the nature of a Soverign or object. For instance, they might see the rising sun behind the Soverign of Dawn. Turning" +
						" the Sight on is a level-0 Aspect miracle. It can be turned off at will. Powers Afflicted with the Code of the Wild can also detect pivotal choices or stolen freedoms, even through walls." +
						" Without a Gift, however, this is an unreliable ability."
			},
			{
				"level": 1,
				"name": "highHumanLevel",
				"label": "High-Human Level",
				"text":	"Level-1 Aspect miracles lie within the potential of very competent humans. This includes athletic ability, up to the level of bronze-medal Olympians.",
				"examples": [
					"Running through a forest in perfect silence.",
					"Performing a Judo throw on a demon.",
					"Catching arrows.",
					"Computing cube roots in one's head.",
					"Remembering being born.",
					"Very sharp senses."
				]
			},
			{
				"level": 2,
				"name": "worldRecordPerformance",
				"label": "World-Record Performance",
				"text": "Level-2 Aspect miracles lie at most a <i>tiny</i> bit above the ability of the greatest mundane humans, including setting world records, solving moderate sets of linear equations instantly, and" +
						" so on. Humans descended from an Imperator and idiot savants can erform one or two miracles of this level regularly, but no other humans can. At best, it might be something a level-1 performer" +
						" could hope to do once or twice..",
				"examples": [
					"Running soundlessly through a forest with a thorn in one's foot.",
					"Exactly measuring distances by eye.",
					"Remembering anything you've ever heard."
				]
			},
			{
				"level": 2,
				"name": "guising",
				"label": "Guising",
				"text": "Level-2 Aspect miracles also enable \"Guising\", a form of shapeshifting that all Powers possess. This allows a Power to make themselves more suitable for their environment without losing thier" +
						" selfness. The Power using the Guising does not choose thier form; they take on a shape suited to the local population. Further, their shape" +
						" reflects their natural appearance as much as possible - unlike some Gifts, Guising alone cannot disguise a Power from those who know of its existence. The Sight sees directly through a Guise." +
						" Physical laws, however, reflect the Guise.<br />Powers can Guise as animals, but only if those animals are the highest life form in the vicinity.",
				"examples": [
					"A stately and august Power could adopt the form of a Chinesse mandarin in China, an African business potentate in Nigeria, a regal Jotun in Jotunheim, a squid person in a Chancel" +
					" where squids are the dominant species, or a shark undersea.",
					"A Power marooned far from land might Guise into a fish or a bird. No Power likes to rely on this hope."
				]
			},
			{
				"level": 3,
				"name": "improbablyFeats",
				"label": "Improbably Feats",
				"text": "Level-3 Aspect miracles are physically possible, but unreasonable for a normal human to even attempt. This includes things such as standing on eight fingertips, skeet shooting" +
						" while surfing, running on fencetops, or punching through steel, and equivalent mental feats.",
				"examples": [
					"Outcomputing a Pentium processor.",
					"Posing for a magazine without needing retouching.",
					"Shattering rocks with a blow.",
					"Inventing new martial art styles with a certainty of success."
				]
			},
			{
				"level": 4,
				"name": "veryImprobablyFeats",
				"label": "Very Improbably Feats",
				"text": "Level-4 Aspect miracles straddle the border of physical impossbility: things like throwing a motorcycle and standing on two fingertips; outcomputing a supercomputer or singing both" +
						" halve of a duet. In general, if there's any chance a human could have once accomplished it - and humans have apparently bounced cannonballs - it can be done with a level-4 Aspect" +
						" miracle.",
				"examples": [
					"Analyzing complex moral situations precisely.",
					"Throwing a motorcycle or a small car.",
					"Running on the heads of a crowd.",
					"Tracking someone by scent."
				]
			},
			{
				"level": 5,
				"name": "featsImpossibleForHumans",
				"label": "Feats Impossible for Humans",
				"text": "Level-5 Aspect miracles are not physically possible for humans, but might approximate the abilities of animals or machines; they give capabilities possessed by non-human mundane inhabitants of Earth." +
						" Birds can fly, so an enormous gliding leap is a level-5 Aspect miracle. Cats are fast, so this level includes inhuman speed. Characters that aren't human can do appropriate things a bit better:" +
						" for example, winged characters, even without an appropriate Gift, can fly as a level-5 miracle.",
				"examples": [
					"Catching bullets",
					"Archery at 200 feet"
				]
			},
			{
				"level": 6,
				"name": "universallyImprobableFeats",
				"label": "Universally Improbable Feats",
				"text":	"Level-6 Aspect miracles do not fit any of the levels above but remain bounded by reason and rational constraints. It's a level-6 Aspect miracle if you can imagine someone doing it without magic. It is," +
						" for example, physically impossible to lift a mountain, because the chunks would break off in one's hands. However, at this level, one can lift a weight that is as heavy as a mountain.",
				"examples": [
					"Crushing granite to powder.",
					"Running at Mach 3.",
					"Writing a thick novel overnight.",
					"Memorizing everything ever written.",
					"Defeating an army in single combat, one-by-one.",
					"Reconciling quantum mechanics and general relativity."
				]
			},
			{
				"level": 7,
				"name": "impossibleForAnyoneLocal",
				"label": "Impossible Feats (Local effects)",
				"text":	"Level-7 Aspect miracles are epic in scope. They can be truly impossible, such as drinking a pond, but they must remain easy to conceptualize. Level 7 is additionally limited in that it cannot affect" +
						" vast areas. These miracles feed on the character's personal energies, and their effects dwindle more than a few miles away. The Power cannot blow down an army, but they could kock down thousands with " +
						" a breath. At this level, the Power invoking the miracle can show absolute and total mastery of any skill of any sort, and they are able to solve even theoretically unsolvable problems.",
				"examples": [
					"Taking down a blimp with a thrown hatpin.",
					"Taking down a blimp with a thrown courthouse.",
					"Swallowing elephants.",
					"Shouting loud enough to kill."
				]
			},
			{
				"level": 8,
				"name": "impossibleForAnyone",
				"label": "Impossible Feats (Non-local effects)",
				"text": "Level-8 Aspect miracles are also epic, nearly impossible, and can affect huge sweeps of territory. This level is for shouts that deafen countries, for lifting mountains, and for stomping the Earth hard enough" +
						" to activate the San Andreas fault. This is the penultimate miracle level, and the miracles must still bea easy to imagine, but their potential power is enormous.",
				"examples": [
					"Jumping between continents",
					"Shooting down the sun",
					"Drinking a lake",
					"Swallowing cities"
				]
			},
			{
				"level": 9,
				"name": "fabled",
				"label": "Fabled Feats",
				"text": "Level-9 Aspect miracles can do anything else allowed by Aspect.",
				"examples": [
					"Intimidating all the males in a crowd aged 12-20, selectively.",
					"Writing a song that is truly irresistably catchy.",
					"Hiding a mountain in your shirt."
				]
			}
		],
		
		"attributeMargins": {
			"simple": 0,
			"normal": 1,
			"hard": 2,
			"deep": 4,
			"wordOfCommand": 8
		}
	};
	nobilisData.realmMiracles = {
		"data": [
			{
				"level": -1,
				"name": "generalRules",
				"label": "General Rules for Realm-Driven Miracles",
				"text": "Some general guidelines for Domain-Drive miracles:<br />" +
						"<ul>" +
							"<li>Realm miracles can <b>only affect things inside your Chancel</b><br />" +
							"<li>Realm miracles are like Domain miracles in which <i>everything</i> inside your Chancel is part of your Estate<br />" +
							"<ul>" +
								"<li>Up to 10 tons of material</li>" +
								"<li>One square mile of territory</li>" +
								"<li>One typical instance of the relevant Estate</li>" +
							"</ul></li>" +
							"<li>Lesser miracles are not mundane, but they create relatively mundane things, with limited miraculous properties. Anything on an \"epic\" scale typically requires a major" +
							" miracle.</li>" +
							"<li>A miracle of any level <b>can be combined with other miracles of its level or lower</b>, as long as it remains a single conceptual action.</li>" +
							"<li>Unlike Domain miracles, Realm miracles do not require extra RMPs to be used at a distance.</li>" +
							"<li>Powers cannot be directly targetted by Realm miracles, except by themselves.</li>" +
						"</ul>"
			},
			{
				"level": 0,
				"name": "realmDrivenDivinations",
				"label": "Realm-Driven Divinations",
				"text":	"Level-0 miracles, Realm-Driven Divinations, tell you about threat or damage to your Chancel. The life and inanimate things of your Chancel will cry out, and you will feel their pain" +
						" unless you are concentrating intensely on other matters."
			},
			{
				"level": 1,
				"name": "ghostMiracles",
				"label": "Ghost Miracles",
				"text":	"Level-1 miracles summon \"ghosts\" of nearly anything within one's Chancel. Examples include ghostly fires with a little bit of heat and ghostly sunlight that can illuinate a book." +
						" These miracles, also known as <b>cantrips</b>, are not true illusions. They are partially transparent to the" +
						" Sight, and even a mortal can sometimes tell that they are only seemings. Characters can use them to make their environment a little more comfortable.<br />" +
						"They are also the weapon of choice for formal Noble duels: two Nobles will try to best one another using only ghostly miracles that cause no real harm but that show a shimmaring image" +
						" of what they could accomplish.",
				"examples": [
					"(Music) Make an instrument sound better.",
					"(Forests) Make a \"ghost clearing\" for more comfortable sleep.",
					"(Storms) Make a day seem gloomier.",
					"(Night) Decorate a bedroom with little glowing \"stars\".",
					"(Emotion) Make someone calm sound angry.",
					"(Roads) Make a trail that doesn't go anywhere important.",
					"(Books) Fill a shelf with boring textbooks on nothing of note."
				]
			},
			{
				"level": 2,
				"name": "lesserDivinations",
				"label": "Lesser Divinations",
				"text": "Level-2 miracles give one mundane information things within their Chancel. The biggest limitation of Lesser Divinations of Realm is that the Power must know <i>what</i> they are interested" +
						" in before they can divine it.",
				"examples": [
					"Know just about any mundane thing in your chancel, assuming you know what to ask."
				]
			},
			{
				"level": 3,
				"name": "lesserPreservations",
				"label": "Lesser Preservations",
				"text": "Level-3 miracles can ward and preserve anything within the character's Chancel. If the protected items leaves the Chancel, the Power must maintain the ward with miracle points," +
						" or its benefits end. The highest benefits that can be conferred with a Lesser Preservation on a creature is Durant, which is simple damage immunity. However, these protections" +
						" fade quickly once the creature leaves the Chancel, and they do not come back automatically upon their return.",
				"examples": [
					"Ward a creature from damage, at least while they remain in your Chancel."
				]
			},
			{
				"level": 4,
				"name": "lesserCreations",
				"label": "Lesser Creations",
				"text": "Level-4 miracles can create almost anytihng within one's Realm. However, large-scale creations such as mountains, hurricanes, and armies are beyond the normal scope of a single level-4" +
						" Realm miracle. These things can be built slowly from such miracles - ten soldiers, one boulder, or a stormcloud at a time. Level-4 miracles can also create items lacking certain normal" +
						" properties. However, unlike Domain miracles, <b>these miracles can only create physical things</b>. Additionally, Realm-based creation <b>cannot create anything that could not somehow be" +
						" created within the Chancel without the use of a miracle</b>. This excludes most items of true power (unless purchased during Chancel creation), and it certainly excludes Nobilis.</b>" +
						"Finally, things created with Realm miracles fade upon leaving the Chancel unless they are sustained with RMPs. If they depend upon magic or technology that only work within the Realm, they" +
						" will not function on Earth, sustained or no.",
				"examples": [
					"Make just about anything... as long as it stays within your Chancel."
				]
			},
			{
				"level": 5,
				"name": "lesserDestructions",
				"label": "Lesser Destructions",
				"text": "Level-5 miracles can remove any mundane object or property of a mundane object from your Chancel.",
				"examples": [
					"Destroy that mosquito that keeps buzzing around you; smite it into oblivion!"
				]
			},
			{
				"level": 5,
				"name": "majorDivinations",
				"label": "Major Divinations",
				"text": "Level-5 miracles include major Divinations, which can \"see\" or \"hear\" anything that occurs within your Chancel, look into its past, or peer cloudily into its future.",
				"examples": [
					"Spy on your friends!"
				]
			},
			{
				"level": 6,
				"name": "lesserChanges",
				"label": "Lesser Changes",
				"text":	"Level-6 miracles can adjust just about anything minor or change just about any circumstance.",
				"examples": [
					"Make your chair <i>slightly</i> higher so it stops hurting your back.<br />Until it leaves the Chancel, of course."
				]
			},
			{
				"level": 6,
				"name": "majorPreservations",
				"label": "Major Preservations",
				"text": "Level-6 miracles can make any person or thing effectively Immortal while they're within the confines of your Realm. Again, this fades quickly once they leave.",
				"examples": [
					"Stop worrying about those bloody assassination attempts by making your skin harder than steel."
				]
			},
			{
				"level": 7,
				"name": "majorCreations",
				"label": "Major Creations",
				"text":	"Level-7 miracles can create nearly anything within one's Chancel, within the normal limits of a Realm-based Creation miracle. And, of course, they cannot create Nobilis or anything like that." +
						" Don't try to cheat.",
				"examples": [
					"Create a mountain directly over the mosquito assassin's guild."
				]
			},
			{
				"level": 8,
				"name": "majorDestructions",
				"label": "Major Destructions",
				"text": "Level-8 miracles can destroy just about anything within one's Chancel.",
				"examples": [
					"Destroy the mosquito assassin's guild so utterly, it's like it never existed in the first place."
				]
			},
			{
				"level": 9,
				"name": "majorChanges",
				"label": "Major Changes",
				"text": "Level-9 miracles, Major Changes, can do anything else within a character's Realm, following the other rules regarding miracles of Realm.",
				"examples": [
					"<h2>PHENOMINAL COSMIC POWER</h2> <span style='font-size: 8px'>itty-bitty living space</span>."
				]
			}
		],
		
		"attributeMargins": {
			"simple": 0,
			"normal": 1,
			"hard": 2,
			"deep": 4,
			"wordOfCommand": 8
		}
	};
	
	nobilisData.miracleDifficulties = {
		"simple": {"cost": 0, "name": "Simple", "description": "These miracles require no effort from you; just your miraculous action."},
		"normal": {"cost": 1, "name": "Normal", "description": "These miracles require a bit of effort: (C) (A)MP and your miraculous action."},
		"hard": {"cost": 2, "name": "Hard", "description": "These miracles require a fair bit of effort: (C) (A)MP and your miraculous action."},
		"deep": {"cost": 4, "name": "Deep", "description": "These miracles require a lot of effort: (C) (A)MP and your miraculous action."},
		"wordOfCommand": {"cost": 8, "name": "Word of Command", "description": "These are the rarest and most difficult of miracles. You may only cast them at the cost of (C) (A)MP, your miraculous action, and a grievous wound."}
	};
	
	nobilisData.giftMiracleExamples = [
		"Immortality - <i>Greater Preservation of the Self</i>. This gift provides near-total immunity to anything that would kill a character, in any way, in any situation. Unless you leave Earth, you're pretty dang safe." +
		" Base cost is 6, it applies automatically as a passive(+1), it affects only one's self (-3), it includes all imaginable uses of immortality (+1), it's relatively rare (+1). This results in a cost of 6+1-3+1+1=<b>6" +
		" character points</b> for a gift of Immortality, brought about by an automatic invocation of a Major Preservation of the Self.",
		"Fire Breath - <i>Lesser Creation of Fire</i>. Base cost is 4, it takes a simple miracle to activate (-1), it affects local things only (-1), it has a limited selection of applications (-2), it's relatively common (+0)." +
		" This results in a cost of 4-1-1-2+0=<b>1 (the minimum cost of a gift)</b>. If the character wished to add Penetration 3, for instance, which would allow the fire breath to extend into any Noble's space with Spirit 3" +
		" or less, the calculation would be 4<b>+3</b>-1-1-2+0=<b>3</b>.",
		"Durant - <i>Lesser Preservation of the Self</i>. This gift offers basic resistance to injury without enabling the total immunity of Immortality. Base cost is 3, it activates automatically as a passive (+1), it affects" +
		" only the self (-3), it has limited scope of usage (-2), and it's common. 3+1-3-2=-1, meaning this gift would cost the <b>minimum of 1 character point</b>.",
		"Eternal - <i>Greater Preservation of the Self</i>. Base cost is 6, it applies automatically (+1), it only affects one's self (-3), it has comprehensive scope (-1) and it's common. Thus, its cost is 6+1-3-1=<b>3</b>.",
		"Glorious - <i>Major Creation of Emotion</i>. With this gift, the character can choose to command an appearance that has an <i>enormous</i> impact on the behaviors of mortals and, to a lesser extent, other Nobles. This" +
		" could be an otherworldly beauty, a visage of terror, or something else. Powers are immunte to the miraculous part of the gift, but they could still be moved by the beauty or horror. As a Major Creation of Emotion, this" +
		" gift would have a base cost of 7. It requires a simple miracle to activate (-1), it affects the creatures in the local area (-1), its utility is limited to \"one trick\" with regards to its miraculous aspect (-3), and" +
		" it's a fairly common gift (+0). This results in a cost of 7-1-1-3+0=<b>2 character points</b>." +
			"<ul><li>One notable example of someone possessing this gift? <b>Helen of Troy</b>. You might have heard of her.</li></ul>",
		"Immutable - <i>Lesser Preservation of the Self</i>. This gift lowers the requiremnets for the Power to continue living. They may get hungry or tired, but they do not explicitly require food, water, air, etc., as they are" +
		" maintained by this gift. Like Durant, this gift would cost fewer than 1 character point, so it costs the minimum of <b>1</b>."
	];
	
	nobilisData.estatePropertiesExamples = [
		{
			"estate": "Fire",
			"bonds": [
				"Fire is a useful tool (1 point)",
				"Fire brings enlightenment (3 points)",
				"Fire wards off danger (1 point)",
				"Fire belongs to humanity (2 points)"
			]
		},
		{
			"estate": "Fire, differently",
			"bonds": [
				"Fire is always hungry (3 points)",
				"Fire dstroys that which it consumes (2 points)",
				"Fire harms what it touches (2 points)"
			]
		},
		{
			"estate": "Death",
			"bonds": [
				"Death ends life (1 point)",
				"Death brings grief (1 point)",
				"Death comes for us all (1 point)",
				"Death waits patiently (1 point)",
				"Death comes suddenly (1 point)",
				"Death cannot be returned from (1 point)",
				"Death leads to a new existence (1 point)"
			]
		},
		{
			"estate": "Taxes",
			"bonds": [
				"Taxes take your money and valuables (2 points)",
				"Taxes build public works (1 point)",
				"Takes empower governments (1 point)",
				"Takes redirect the flow of money (2 points)",
				"Takes are as certain as Death (1 point)"
			]
		},
		{
			"estate": "Death, differently",
			"bonds": [
				"Death cuts things short (4 points)",
				"Death comes suddenly (2 points)",
				"Death brings numbness (1 point)"
			]
		},
		{
			"estate": "Color",
			"bonds": [
				"Color makes things distinctive (2 points)",
				"Color exudes life (2 points)",
				"Color carries meaning (2 points)",
				"Color catches the eye (1 point)"
			]
		},
		{
			"estate": "The Void",
			"bonds": [
				"The Void is the space where something <i>could</i> be (2 points)",
				"The Void hungers to be filled (2 point)",
				"The Void extinguishes emotion, knowledge, and value (2 points)",
				"The Void is home to very strange things (1 point)"
			]
		},
		{
			"estate": "Time",
			"bonds": [
				"Time separates events from each other (2 points)",
				"Time relates given events to each other (1 point)",
				"Time gives you cause and effect (3 points)",
				"Time lets you change and become different (1 point)"
			]
		},
		{
			"estate": "The Infinite",
			"bonds": [
				"The Infinite is inexhaustible (3 points)",
				"The Infinite defies arithmetics (1 point)",
				"The Infinite inspires awe and confusion (2 points)",
				"The Infinite contains all possibilities (1 point)"
			]
		},
		{
			"estate": "Networks",
			"bonds": [
				"Networks are grand systems made of humble parts (2 points)",
				"Networks grow to support their utilization (2 points)",
				"Networks behave unpredictably when their particulars fail (1 point)",
				"Networks take things where they need to go (2 points)"
			]
		},
	];
	
	nobilisData.limitDescriptionText = "<p><b>Limits</b> are constant restrictions to your features and abilities. They grant character points (normally permanent miracle points, but" +
									   " we're doing this differently for now) upon acquisition rather than any miracle points during play; they are assumed to always affect your" +
									   " character. For instance, you might be hated in your Chancel, despite having a high Realm, or you might be unable to fully control your Anchors," +
									   " forcing you to work with them more as equals. Click for more examples.</p>";
	nobilisData.limitExamples = [
		"<b>Dead</b> <i>3 points</i> - The PC is dead or otherwise bodiless and can only act through their Anchors. They can create new Anchors using an established Anchor's blood or" +
		" tears. If they lose all of their Anchors, however, they fade away. Acting through their anchors means they must pay additional SMP to cast Aspect miracles.",
		"<b>Disabled</b> <i>1-2 points</i> - The PC is disabled in some way. They could be blind, lame, one-handed, psychotic, etc. In this way, their Aspect-based abilities are" +
		" limited. A minor disability like anosmia (inability to smell) might grant 1CP, but more major disabilities like blindness might grant 2CP.",
		"<b>Focus</b> <i>1 point per 3 cp invested</i> - This is a very common limit. Some of the Power's abilities (attribute levels, miracle points, Gifts, etc.) are bound in a" +
		" physical object. If this Focus leaves its owner's hands, whoever takes it gains the abilities brought through it.",
		"<b>Hated</b> <i>1 per point of Realm level</i> - The Power is not well-loved by their Chancel. Armed rebellion is unlikely, particularly if there are non-Hated PCs, but" +
		" distrust and conspiracy surround the Chancel when this Power is concerned.",
		"<b>Light Touch</b> <i>1 per point of Spirit level</i> - The Power cannot directly control their Anchors and cannot use any miracles through their Anchors without their consent." +
		" The goodwill of a Power's Anchors becomes very important, and an uncooporative Anchor can be much more frustrating.",
		"<b>Manifestation</b> <i>1-2 points</i> - The character possesses a vulnerability to things conceptually opposed to their Estate. For example, the Domaina of Illusions might be" +
		" unable to affect any who do not believe in him; the Domina of Fire might find water and suffocation as far more dangerous.",
		"<b>Unseen</b> <i>2 points</i> - You must maintain your anonymity at all times. If anyone outside of your Imperator, your Familia, and your Anchors discovers your identity, you" +
		" lose 1MP. If you voluntarily reveal your identity, you lose 3MP. You can only suffer this loss once per story."
	];
	
	nobilisData.restrictionDescriptionText = "<p><b>Restrictions</b> are handicaps that grant miracle points when they come up as a problem during play. For instance, if you are unable to" +
											 " enter a house uninvited and <i>really</i> need to get in somewhere, you might get a few miracle points for being bound to the restriction.</p>";
	nobilisData.restrictionExamples = [
		"<b>Blatant</b> - Cannot use inobvious miracles.",
		"<b>Cigarette Bond</b> - The character is bound to befriend anyone with whom they share a smoke, and cannot resist the offer of a cigarette." +
		" Yields 1MP when binding the character to a nice Power, 2MP when binding them to a hostile Power, and 3MP when binding them to an Excrucian.",
		"<b>Doomed</b> - Some horrible fait awaits the character, and their odds of avoiding it are small. When their doom comes nigh, they gain 3MP" +
		" to provide them with a last-ditch opportunity to avoid their fate.",
		"<b>Summonable</b> - A character can be sumoned with appropriate magic, regardless of if they wish to heed the summons. This is worth 1MP" +
		" when it comes up during play, and 2MP if the character cannot cross an unbroken pentagram (or the like) so that the summoner can hold them.",
		"Cannot enter buildings without an invitation",
		"Must sleep with a virgin the night before performing miracles",
		"Cannot kill",
		"Cannot cross running water",
		"Hated by Animals"
	];
	
	nobilisData.virtueDescriptionText = "<p><b>Virtues</b> are immutible aspects of a Noble's character and the code they follow. There are not many absolutes with humanity, but the divine part of" +
										" a Noble's soul that goes beyond humanity can result in a Virtue. Unlike lowercase \"virtues\" in humans, a noble with a Virtue <i>cannot</i> perform any" +
										" action that would violate it. Any virtue or vice may be selected as a Virtue, but characters are only recommended to take one.</p>";
	nobilisData.virtueDescriptionTextExtended = nobilisData.virtueDescriptionText.substring(0, nobilisData.virtueDescriptionText.indexOf("</p>")) +
												" Even trickery cannot overcome a Virtue; a Virtuously Honest character cannot be tricked into telling a lie. Someone with" +
												" the Virtue \"Faith\" cannot lose their faith, even if subjected to all the tortures of Hell.</p>";
	nobilisData.virtueBenefits = [
		"Nothing can force or trick you into doing something against your Virtue, although you are not <i>guaranteed</i> the ability to actively pursue it.",
		"Characters with a Virtue have an uncanny sense of the \"virtuous\" alternative in a given situation.",
		"A character can spend one Spirit Miracle Point to make their Virtue immediately obvious to all onlookers.",
		"When the Virtue gets the character into <i>horrible</i> trouble, they receive a miracle point."
	];
	
	nobilisData.affiliations = [
		{
			"name": "Code of the Angels",
			"principles": [
				"Beauty is the highest principle.",
				"Justice is a form of beauty.",
				"Lesser beings should respect their betters."
			]
		},
		{
			"name": "Code of the Fallen Angels",
			"principles": [
				"Corruption is the highest principle.",
				"Suffering is a form of corruption.",
				"Power justifies itself."
			]
		},
		{
			"name": "Code of the Light",
			"principles": [
				"Humanity must live, and live forever.",
				"What must be done ought be done cleanly.",
				"Humans must be protected, particularly from themselves."
			]
		},
		{
			"name": "Code of the Dark",
			"principles": [
				"Humanity should destroy themselves, individually.",
				"Humanity should destroy itself, collectively, except for a few toys.",
				"Ugliness to human eyes shows that one is worthy."
			]
		},
		{
			"name": "Code of the Wild",
			"principles": [
				"Freedom is the highest principle.",
				"Sanity and mundanity are prisons.",
				"Give in kind with a gift received."
			]
		},
		{
			"name": "Other (Write down in character description)",
			"principles": [
				"Choose this option if you work with your HG to create a custom Affiliation for your character."
			]
		}
	];
	
	nobilisData.aspectLevels = [
		{
			"name": "Of Mortal Form",
			"description": "For some Powers, their Commencement is a joy. For others, it is very much <i>not</i>. Powers with Aspect 0, by a mistake of Commencement, are of mortal form, and" +
						   " they must use a miracle point to even bypasssimple obstacles, such as a locked door. These characters might even lose their heads in an emergency, even if their" +
						   " player does not."
		},
		{
			"name": "Metahuman",
			"description": "You are one step beyond human, possessing formidable physical and mental faculties in every field. On occasion, you may perform wondrous feats of body and mind. This" +
						   " is a common level taken amongst Powers who govern high, flighty, or ethereal things such as Thought, Emotion, Knowledge, or Love."
		},
		{
			"name": "Legendary",
			"description": "You compare favorably with the greatest heroes and villians of legend. You rank, without effort, among the best human savants and athletes, and you can go significantly" +
						   " beyond human capabilities if pushed."
		},
		{
			"name": "Inhuman",
			"description": "You inhabit a body empowered by the magic that suffuses your being. You are no longer simply flesh and bone; rather, you are ether, astral energy. At this level of" +
						   " Aspect, you have perfect self-possession, discipline, artistic ability, scientific ability, and supercomputer-like speed when solving formal problems. You are forever" +
						   " distanced from most normal humans."
		},
		{
			"name": "Celestial",
			"description": "You are touched with divine; your essence echoes with the purest everlasting primal power, burning with an everlasting flame. You resist all efforts to addict, hypnotize," +
						   " or psychically dominate you."
		},
		{
			"name": "Exemplar",
			"description": "Yuu blur the line between rule over your Domain and your own personal power. You integrate divine essence and use it to the utmost extent. Your fists can split mountains;" +
						   " your breath can blow away armies; you can wound the sun with an arrow. Please don't."
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		}
	];
	
	nobilisData.domainLevels = [
		{
			"name": "Pawn, or Crippled Domain",
			"description": "You do not command your Estate; it commands <i>you</i>. Well, not literally, but you have to spend DMPs to get it to do <i>anything</i>. The term \"Pawn\" is typically" +
						   " an insult (although some do wear it with pride). This might be a sign of a lack of trust by your Imperator."
		},
		{
			"name": "Baronet, or Weak Domain",
			"description": "You have basic mastery over your Estate, and you can work a miracle or two on occasion. You're generally a person (human?) first and a symbol of your Estate a distant second."
		},
		{
			"name": "Viscount, or Minor Domain",
			"description": "Your Domain serves you well. Miracles of comfort and divination come readily. With effort, you can work more interesting marvels. You also appear brightly in the Sight."
		},
		{
			"name": "Marchessa, or Forceful Domain",
			"description": "The Forceful Domain holds the power of perpetuation: you can Preserve elements of your estate as a simple miracle (see Domain miracles). Marchessas deal with strengthening" +
						   " states of being."
		},
		{
			"name": "Duchess, or Masterful Domain",
			"description": "You have immersed yourself deeply in the mysteries of your Estate. Even in mortal eyes, unless you are deeply Guised, your nature is obvious. A man who sees the Duke of" +
						   " Famine will remember him not by his eyes but by the sense of human hunger and suffering that hangs in the air about him. You never lack in magics; to mortals, your powers" +
						   " will often seem godlike."
		},
		{
			"name": "Regal, or Majestic Domain",
			"description": "Regals aren't always the most well-regarded of Powers, but they <i>are</i> the truest representations of their Domains. You are a living god of what you stand for. You are" +
						   " a force of nature; an aspect of the world. You might perform feats worthy of the Creator."
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		}
	];
	
	nobilisData.realmLevels = [
		{
			"name": "Citizen",
			"description": "You have almost no gift of rule. You are a mere and mundane (if powerful) citizen of your Chancel. You may have an official title, and you may have dominion over other citizens," +
						   " but you lack the resources to shape your Chancel directly. Other Noblilis rarely respect you. You might have a... <i>lively</i> time carrying out your duties in your Chancel, as" +
						   " you'll be a normal human for most of them.<br />" +
						   "<b>\"Oh,\" he said, and shrugged. \"I can't do any particular magic here...\"<br />" +
						   "\"Then why do they call you King?\"<br />" +
						   " - from Lady of the Plague, by Emily Chen</b>"
		},
		{
			"name": "Radiant",
			"description": "You have the first hints of control over your Chancel. Your reign extens to ghosts and fragmentary forces - not the sun, but traces of light; not the fire, but traces of heat;" + 
						   " not frigid ice, but hints of cold. You are called Radiant because you are tied not to your Chancel's essence but to its surface condition."
		},
		{
			"name": "Realm's Heart",
			"description": "You are better able to keep hold on your Chancel. It takes you a thought to learn anything you wish about events and situations, or about its mundane inhabitants. If you" +
						   " routinely \"patrol\" your Chancel, you will discover most threats to your home early. Almost all Nobilis respect you enough to be polite, and you have a decent home field" +
						   " advantage. Finally, you are always aware of what is happening at the mystic Heart of your Chancel. You are forever a part of this place."
		},
		{
			"name": "Warden",
			"description": "It's dangerous to fight a Warden on their own ground. You have the power of Preservations, and you can magically reinforce your armies and lands against assault. You are rooted" +
						   " firmly in your Chancel, at least in a spiritual sense."
		},
		{
			"name": "True King or Queen",
			"description": "You are so powerful in your domain, you might even hold off an Imperator or an unsharded Excrucian within your home. Your power is as potent as a Duke's and as versitile as you" +
						   " can imagine. You are almost universally respected, if not liked, by other Nobles. You are personally responsible for much of the way your Chancel works. This level of power is" +
						   " appropraite for some Nobles born and raised in their Chancels."
		},
		{
			"name": "Tempest",
			"description": "You have mastered not only the powers of Creation within your chancel, but those of Destruction as well. Walking into a Tempest's Chancel is the most fearsome danger an enemy can" +
						   " face. Even Excrucians wilt as the thought of trying to break a Chancel with such a guardian in it. Imperators themselves typically have this level of Realm, although they can be" +
						   " distracted by an attack in the Spirit World; <i>you</i> cannot be."
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		}
	];
	
	nobilisData.spiritLevels = [
		{
			"name": "Candleflame",
			"description": "You burn softly. You might be strong-hearted and willful, but your soul is still relentlessly mundane. Your divine soul-shard does not have a firm anchor, leaving your humanity" +
						   " alone to fill the hole. You have no innate defenses against magical assault."
		},
		{
			"name": "Heartfire",
			"description": "Hearthfires are those whose company is most comfortable. You have enough presence to be felt in the room, but not enough to burn. You can be looked at without shock; heard without" + 
						   " an inherent desire to obey. You have some synergy between your human and divine souls. You have some defenses against magical assault."
		},
		{
			"name": "Incandescent Flame",
			"description": "You have crossed a threshold, between the gift of fire and its curse, between the warmth of a hearth and a flaming arrow used in war. In the end, your passion may bring you to the" +
						   " point of death. It may not bring you back again. Your presence is impressive, to say the least, and it would take a good disguise to hide this entirely."
		},
		{
			"name": "Sunfire",
			"description": "Your mortal soul has gained some small mastery over your <i>spiritus Dei</i>. Your obediance to your Imperator is still stong, but it has grown in you less. You are a shout of life;" +
						   " an obvious presence. You also have some good natural defenses against magical assault."
		},
		{
			"name": "Conflagration",
			"description": "You are a Conflagration, a titanic personality so deep in selfhood that even your Anchors grow in presence and authority. Whatever traits compose your personality are augmented by" +
						   " miraculous power. You do not change as the years go by. You are also one one of the finest practitioners of the dark arts - namely, the Nettle Rite and the Abhorrent Investment." +
						   " This level best fits Nobles who are strong-willed and valorous."
		},
		{
			"name": "Inferno",
			"description": "The mortal spirit and divine passions locked inside you are perfectly blended and complemenatry. You can wear your Anchor's bodies as if they were your own. You have an <i>enormous</i>" +
						   " advantage in battles with Excrucians or other powers, all other traits being equal. Your skill with ritual magics approaches that of an Imperator. Achieving this level of accomodation" +
						   " between your mortal and divine spirit is, to most Sovereigns, one of the most desirable prospects."
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		},
		{
			"name": "Imperial",
			"description": "How did you pick this?"
		}
	];
})(this)