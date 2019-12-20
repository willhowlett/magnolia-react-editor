import * as React from 'react';
import PropTypes from 'prop-types';
import { TemplateAnnotations } from '@magnolia/template-annotations';
import { RendererProvider } from './RendererContext';

export default function enableMgnlRenderer(WrappedComponent, componentMappings) {
    return class extends React.Component {
        static propTypes = {
            templateDefinitions: PropTypes.object,
            content: PropTypes.object,
            inPageEditor: PropTypes.bool
        };

        static defaultProps = {
            templateDefinitions: null,
            content: null,
            inPageEditor: false
        };

        constructor(props) {
            super(props);
            const { templateDefinitions, content } = props;
            const isInPageEditor = Boolean(window.parent && window.parent.mgnlRefresh);

            this.state = {
                templateDefinitions,
                componentMappings,
                content,
                inPageEditor: isInPageEditor
            };

            if (isInPageEditor) {
                this.createPageComment();
            }
        }

        createPageComment() {
            const { content } = this.props;
            const { templateDefinitions } = this.state;
            const pageTemplateId = content['mgnl:template'];
            const pageOpenCommentString = TemplateAnnotations.getPageCommentString(content, templateDefinitions[pageTemplateId]);
            const pageCloseCommentString = '/cms:page';

            // NOTE: Remove old cms:page comments
            const { childNodes } = document.head;
            const comments = [];
            childNodes.forEach((node) => {
                if (node.nodeType === 8 && node.textContent.includes('cms:page')) {
                    comments.push(node);
                }
            });
            comments.forEach((item) => item.remove());

            document.head.appendChild(document.createComment(pageOpenCommentString));
            document.head.appendChild(document.createComment(pageCloseCommentString));
        }

        render() {
            return (
                <RendererProvider value={this.state}>
                    <WrappedComponent {...this.props} />
                </RendererProvider>
            );
        }
    };
}
