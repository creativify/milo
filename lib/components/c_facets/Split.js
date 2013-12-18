// <a name="components-facets-split"></a>
// ###split facet

'use strict';

var ComponentFacet = require('../c_facet')
	, Component = require('../c_class')
	, facetsRegistry = require('./cf_registry');

var Split = _.createSubclass(ComponentFacet, 'Split');

_.extendProto(Split, {
	init: init,
	start: start,
	make: make,

	isSplittable: isSplittable,
	_makeSplit: _makeSplit,

	require: ['Dom']

	// _reattach: _reattachEventsOnElementChange
});

facetsRegistry.add(Split);

module.exports = Split;


// init Split facet
function init() {
	ComponentFacet.prototype.init.apply(this, arguments);

	this._splitSender = undefined;
}


// start Split facet
function start() {
	ComponentFacet.prototype.start.apply(this, arguments);
}


/**
 * make
 * Splits component this facet belongs to on the selection,
 * but only if the selection is empty and there is some text before selection.
 * Uses _makeSplit to do actual split.
 * @return {Component} new component created as a result of a split
 */
 function make() {
	if (! this.isSplittable())
		return;

	if (! this.owner.dom.hasTextBeforeSelection())
		return; // should simply create empty component before

	return this._makeSplit();
}


/**
 * _makeSplit
 * Splits component this facet belongs to on the selection.
 * This function is called recursively by `splitElement` to split inner components
 * @return {Component} new component created as a result of a split.
 */
function _makeSplit() {
	var thisComp = this.owner;

	// clone itself
	var newComp = Component.copy(thisComp);
	thisComp.dom.insertAfter(newComp.el);

	splitElement(thisComp.el, newComp.el);

	return newComp;
}


/**
 * splitElement
 * Splits DOM element on the selection point moving everything after it to
 * a new element. Recursively calls itself when it encounters DOM element or 
 * `_makeSplit` when it encounters elements with milo components
 * @param {Element} thisEl element to be split
 * @param {Element} newEl element where all new elements will be moved to.
 */
function splitElement(thisEl, newEl) {
	var selection = window.getSelection()
		, selNode = selection.anchorNode
		, selFound = false;

	Array.prototype.forEach.call(thisEl.childNodes, function(childNode) {
		if (childNode.contains(selNode) || childNode == selNode) {
			var comp = Component.getComponent(childNode);
			if (comp)
				comp.split._makeSplit();
			else if (childNode.nodeType == Node.TEXT_NODE) {
				var selPos = selection.anchorOffset;
				var newText = childNode.splitText(selPos);
				if (newText.textContent)
					newEl.appendChild(newText);
				else
					newEl.innerHTML += '&nbsp;';
			} else {
				var newChildEl = childNode.cloneNode(false);
				newEl.appendChild(newChildEl);
				splitElement(childNode, newChildEl);
			}

			selFound = true;
		} else if (selFound)
			newEl.appendChild(childNode);
	});
}


function isSplittable() {
	var selection = window.getSelection()
		, el = selection.anchorNode;

	if (! this.owner.el.contains(el)) {
		logger.warn('selection is outside this component');
		return false;
	}

	while (el != this.owner.el) {
		var comp = Component.getComponent(el);
		if (comp && ! comp.split)
			return false;
		el = el.parentNode;
	}

	return true;
}