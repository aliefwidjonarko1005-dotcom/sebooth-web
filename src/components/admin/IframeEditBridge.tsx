"use client";

import { useEffect, useRef } from "react";

interface IframeEditBridgeProps {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    onTextClick: (text: string, section: string, fieldKey: string) => void;
}

export function IframeEditBridge({ iframeRef, onTextClick }: IframeEditBridgeProps) {
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleIframeLoad = () => {
            try {
                const doc =
                    iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc) return;

                // Inject script into iframe to make editable elements
                const script = doc.createElement("script");
                script.textContent = `
                    // Find all text nodes with specific patterns
                    function makeTextEditable() {
                        const walker = document.createTreeWalker(
                            document.body,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );

                        let node;
                        const editableSpans = [];

                        while ((node = walker.nextNode())) {
                            const text = node.textContent?.trim();
                            if (text && text.length > 0 && text.length < 500) {
                                // Skip very long text
                                const span = document.createElement('span');
                                span.className = 'sebooth-editable-text';
                                span.textContent = text;
                                span.dataset.section = 'auto';
                                span.dataset.fieldKey = text.substring(0, 30);
                                
                                span.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.parent.postMessage({
                                        type: 'EDIT_TEXT',
                                        text: text,
                                        section: span.dataset.section,
                                        fieldKey: span.dataset.fieldKey
                                    }, '*');
                                });

                                node.parentNode?.replaceChild(span, node);
                                editableSpans.push(span);
                            }
                        }

                        // Add hover effect
                        editableSpans.forEach(span => {
                            span.style.cursor = 'pointer';
                            span.style.transition = 'all 0.15s ease';
                            span.addEventListener('mouseenter', () => {
                                span.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                span.style.outline = '2px dashed #3B82F6';
                                span.style.outlineOffset = '2px';
                            });
                            span.addEventListener('mouseleave', () => {
                                span.style.backgroundColor = 'transparent';
                                span.style.outline = 'none';
                            });
                        });
                    }

                    makeTextEditable();

                    // Observe for new content
                    const observer = new MutationObserver(() => {
                        makeTextEditable();
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                    });
                `;
                doc.body.appendChild(script);

                // Listen for messages from iframe
                const handleMessage = (e: MessageEvent) => {
                    if (e.data.type === "EDIT_TEXT") {
                        onTextClick(e.data.text, e.data.section, e.data.fieldKey);
                    }
                };

                window.addEventListener("message", handleMessage);
                return () => window.removeEventListener("message", handleMessage);
            } catch (err) {
                console.error("Failed to setup iframe edit bridge:", err);
            }
        };

        // Wait for iframe to load
        if (iframe.contentDocument?.readyState === "complete") {
            handleIframeLoad();
        } else {
            iframe.addEventListener("load", handleIframeLoad);
            return () => iframe.removeEventListener("load", handleIframeLoad);
        }
    }, [iframeRef, onTextClick]);

    return null;
}
